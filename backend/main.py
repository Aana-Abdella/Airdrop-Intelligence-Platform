import asyncio
from datetime import datetime, timedelta
from typing import Dict, List

from fastapi import BackgroundTasks, Depends, FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from . import database, notifier, status_engine
from .auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from .config import ACCESS_TOKEN_EXPIRE_MINUTES, CLEANUP_HOURS, SCREENSHOT_BASE
from .models import AirdropCreate, AirdropResponse, AirdropStatus, ProfileCreate, Profile, ProgressStatus, StepExecution, Token, User, UserCreate
from .profile_manager import PROFILE_TEMPLATES, capture_screenshot
from .services.claims import get_claim_queue
from .services.discovery import fetch_discovery_projects
from .services.intelligence import build_project_score, recommend_action
from .services.planner import get_daily_plan
from .services.scheduler import get_scheduled_tasks
from .services.wallets import get_wallet_summary

app = FastAPI(
    title="Airdrop Workflow System",
    description="Secure workflow management for cryptocurrency airdrops with progress tracking and safe reporting.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event() -> None:
    database.create_tables()
    # Create default profiles for demo
    users = database.get_user_by_username("demo")
    if users:
        user_id = users["id"]
        profiles = database.get_profiles_by_user(user_id)
        if not profiles:
            for template in PROFILE_TEMPLATES:
                database.insert_profile(user_id, {
                    "email": template["email"],
                    "wallet": template["wallet"],
                    "chrome_port": template["chrome_port"],
                    "ip_address": template["ip_address"],
                    "location": template["location"],
                    "notes": f"Profile {template['id']} — {template['location']}",
                })
    app.state.status_task = asyncio.create_task(status_engine.schedule_status_updates())
    app.state.cleanup_task = asyncio.create_task(schedule_cleanup())


@app.on_event("shutdown")
async def shutdown_event() -> None:
    for task in [getattr(app.state, "status_task", None), getattr(app.state, "cleanup_task", None)]:
        if task:
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass


async def schedule_cleanup() -> None:
    while True:
        database.cleanup_old_records(CLEANUP_HOURS)
        await asyncio.sleep(86400)  # daily


def _group_airdrops_by_status(airdrops: List[dict]) -> Dict[str, List[dict]]:
    grouped = {status.value: [] for status in AirdropStatus}
    for airdrop in airdrops:
        status_name = airdrop.get("status", AirdropStatus.NEW)
        grouped.setdefault(status_name, []).append(airdrop)
    return grouped


@app.post("/auth/register", response_model=User)
def register(user: UserCreate) -> User:
    if database.get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    user_id = database.create_user(user.username, hashed_password)
    return User(id=user_id, username=user.username, created_at=datetime.utcnow())


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")


@app.get("/auth/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@app.get("/airdrops", response_model=Dict[str, List[AirdropResponse]])
def get_airdrops(current_user: User = Depends(get_current_user)) -> Dict[str, List[AirdropResponse]]:
    airdrops = database.get_airdrops_by_user(current_user.id)
    return _group_airdrops_by_status(airdrops)


@app.get("/dashboard")
def get_dashboard(current_user: User = Depends(get_current_user)) -> dict:
    airdrops = database.get_airdrops_by_user(current_user.id)
    profiles = database.get_profiles_by_user(current_user.id)
    recommendations = []
    for airdrop in airdrops[:5]:
        score = build_project_score(
            funding=70,
            investors=65,
            community=75,
            activity=60,
            difficulty=40,
            cost=20,
            reward=85,
            risk=25,
            history=55,
        )
        recommendations.append(
            {
                "project_name": airdrop["project_name"],
                "score": score["total"],
                "action": recommend_action(int(score["total"]), 25, 20),
            }
        )
    return {
        "active_projects": len(airdrops),
        "profiles": len(profiles),
        "recommendations": recommendations,
        "latest_airdrops": airdrops[:3],
        "claims": [
            {
                "project": item.project,
                "snapshot_date": item.snapshot_date,
                "claim_date": item.claim_date,
                "status": item.status,
                "reminder": item.reminder,
            }
            for item in get_claim_queue()
        ],
        "wallets": [
            {
                "chain": item.chain,
                "balance": item.balance,
                "gas_spent": item.gas_spent,
                "activity_count": item.activity_count,
            }
            for item in get_wallet_summary()
        ],
        "scheduler": [
            {
                "name": item.name,
                "interval_minutes": item.interval_minutes,
                "status": item.status,
            }
            for item in get_scheduled_tasks()
        ],
        "planner": [
            {
                "title": item.title,
                "estimate": item.estimate,
                "cost": item.cost,
                "priority": item.priority,
            }
            for item in get_daily_plan()
        ],
        "discovery_projects": [
            {
                "name": project.name,
                "source": project.source,
                "website": project.website,
                "reward_type": project.reward_type,
                "score": project.score,
                "description": project.description,
            }
            for project in fetch_discovery_projects()
        ],
    }


@app.post("/airdrops", response_model=AirdropResponse, status_code=status.HTTP_201_CREATED)
def create_airdrop(airdrop: AirdropCreate, current_user: User = Depends(get_current_user)) -> dict:
    payload = {
        "project_name": airdrop.project_name,
        "website": str(airdrop.website),
        "reward_type": airdrop.reward_type,
        "reward_amount": airdrop.reward_amount,
        "deadline": airdrop.deadline.isoformat(),
        "claim_link": str(airdrop.claim_link) if airdrop.claim_link else None,
        "status": AirdropStatus.NEW,
    }
    task_dicts = [
        {"task_name": task.task_name, "task_type": task.task_type.value}
        for task in airdrop.tasks
    ]
    airdrop_id = database.insert_airdrop(current_user.id, payload, task_dicts)
    created = database.get_airdrop_by_id(airdrop_id)
    if created is None:
        raise HTTPException(status_code=500, detail="Unable to create airdrop")
    return created


@app.patch("/airdrops/{airdrop_id}/status")
def patch_airdrop_status(airdrop_id: int, status: AirdropStatus, current_user: User = Depends(get_current_user)) -> dict:
    airdrop = database.get_airdrop_by_id(airdrop_id)
    if airdrop is None or airdrop["user_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Airdrop not found")
    database.update_airdrop_status(airdrop_id, status.value)
    airdrop["status"] = status.value
    asyncio.create_task(notifier.notify_airdrop_update(airdrop))
    return airdrop


@app.get("/profiles", response_model=List[Profile])
def get_profiles(current_user: User = Depends(get_current_user)) -> List[Profile]:
    profiles = database.get_profiles_by_user(current_user.id)
    return [Profile(**p) for p in profiles]


@app.post("/profiles", response_model=Profile, status_code=status.HTTP_201_CREATED)
def create_profile(profile: ProfileCreate, current_user: User = Depends(get_current_user)) -> Profile:
    profile_id = database.insert_profile(current_user.id, profile.dict())
    return Profile(id=profile_id, user_id=current_user.id, **profile.dict(), created_at=datetime.utcnow())


@app.post("/step")
def execute_step(execution: StepExecution, current_user: User = Depends(get_current_user)) -> dict:
    # Validate profile belongs to user
    profiles = database.get_profiles_by_user(current_user.id)
    profile_ids = {p["id"] for p in profiles}
    if execution.profile_id not in profile_ids:
        raise HTTPException(status_code=403, detail="Profile not owned by user")

    # Save screenshot
    screenshot_dir = SCREENSHOT_BASE / str(execution.airdrop_id) / str(execution.profile_id)
    screenshot_dir.mkdir(parents=True, exist_ok=True)
    screenshot_path = screenshot_dir / f"{int(datetime.utcnow().timestamp())}.png"
    with open(screenshot_path, "wb") as f:
        f.write(execution.screenshot)

    # Insert progress
    progress_id = database.insert_progress(execution.profile_id, execution.task_id, "DONE", str(screenshot_path))

    # Notify
    airdrop = database.get_airdrop_by_id(execution.airdrop_id)
    if airdrop:
        asyncio.create_task(notifier.notify_airdrop_update(airdrop, str(screenshot_path)))

    return {"progress_id": progress_id, "screenshot_path": str(screenshot_path)}


@app.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user)) -> List[dict]:
    return database.get_notifications_by_user(current_user.id)


@app.post("/refresh")
def refresh_statuses(current_user: User = Depends(get_current_user)) -> Dict[str, str]:
    status_engine.refresh_statuses_for_user(current_user.id)
    return {"detail": "Status refresh started"}
