import asyncio
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Dict, List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from . import database, evidence, notifier, status_engine
from .auth import authenticate_user, create_access_token, get_current_user, get_password_hash
from .config import ACCESS_TOKEN_EXPIRE_MINUTES, CLEANUP_HOURS, CORS_ORIGINS, ENVIRONMENT, SECRET_KEY
from .models import AirdropCreate, AirdropResponse, AirdropStatus, ProfileCreate, Profile, ProgressStatus, StepExecution, Token, User, UserCreate
from .services.intelligence import build_project_score, recommend_action

@asynccontextmanager
async def lifespan(application: FastAPI):
    if ENVIRONMENT == "production" and SECRET_KEY == "development-only-change-me":
        raise RuntimeError("AIP_SECRET_KEY must be configured in production")
    database.create_tables()
    application.state.status_task = asyncio.create_task(status_engine.schedule_status_updates())
    application.state.cleanup_task = asyncio.create_task(schedule_cleanup())
    yield
    for task in [application.state.status_task, application.state.cleanup_task]:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Airdrop Workflow System",
    description="Secure workflow management for cryptocurrency airdrops with progress tracking and safe reporting.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def schedule_cleanup() -> None:
    while True:
        evidence.cleanup_expired_progress(CLEANUP_HOURS)
        await asyncio.sleep(86400)  # daily


def _group_airdrops_by_status(airdrops: List[dict]) -> Dict[str, List[dict]]:
    grouped = {status.value: [] for status in AirdropStatus}
    for airdrop in airdrops:
        status_name = airdrop.get("status", AirdropStatus.NEW)
        grouped.setdefault(status_name, []).append(airdrop)
    return grouped


def _parse_deadline(value: object) -> datetime:
    deadline = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    return deadline.replace(tzinfo=None)


@app.get("/health", tags=["system"])
def health() -> dict:
    return {"status": "ok", "database": "sqlite", "environment": ENVIRONMENT}


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
    progress = database.get_progress_by_user(current_user.id)
    progress_by_airdrop = {}
    activity_by_profile = {}
    for item in progress:
        progress_by_airdrop.setdefault(item["airdrop_id"], []).append(item)
        activity_by_profile[item["profile_id"]] = activity_by_profile.get(item["profile_id"], 0) + 1

    recommendations = []
    for airdrop in airdrops[:5]:
        task_count = len(airdrop.get("tasks", []))
        completed_count = sum(
            item["status"] == ProgressStatus.DONE.value
            for item in progress_by_airdrop.get(airdrop["id"], [])
        )
        deadline = _parse_deadline(airdrop["deadline"])
        days_remaining = max((deadline - datetime.utcnow()).days, 0)
        completion = int((completed_count / task_count) * 100) if task_count else 0
        activity = min(100, 35 + task_count * 10 + completion // 2)
        difficulty = min(100, task_count * 15)
        urgency = max(0, 100 - min(days_remaining, 100))
        risk = min(100, 15 + difficulty // 3 + (20 if not airdrop.get("claim_link") else 0))
        score = build_project_score(
            funding=0,
            investors=0,
            community=0,
            activity=activity,
            difficulty=difficulty,
            cost=0,
            reward=urgency,
            risk=risk,
            history=completion,
        )
        recommendations.append(
            {
                "project_name": airdrop["project_name"],
                "score": score["total"],
                "action": recommend_action(int(score["total"]), risk, 0),
            }
        )

    claims = []
    planner = []
    for airdrop in airdrops:
        deadline = str(airdrop["deadline"])
        if airdrop["status"] == AirdropStatus.CLAIMABLE.value or airdrop.get("claim_link"):
            claims.append({
                "project": airdrop["project_name"],
                "snapshot_date": str(airdrop["created_at"])[:10],
                "claim_date": deadline[:10],
                "status": "Claimable" if airdrop["status"] == AirdropStatus.CLAIMABLE.value else "Monitoring",
                "reminder": "Claim link available" if airdrop.get("claim_link") else "Monitor before deadline",
            })
        if airdrop["status"] not in {AirdropStatus.COMPLETED.value, AirdropStatus.ENDED.value}:
            remaining = [
                task for task in airdrop.get("tasks", [])
                if not any(
                    item["task_id"] == task["id"] and item["status"] == ProgressStatus.DONE.value
                    for item in progress_by_airdrop.get(airdrop["id"], [])
                )
            ]
            for task in remaining[:3]:
                planner.append({
                    "title": f'{airdrop["project_name"]}: {task["task_name"]}',
                    "estimate": "Unestimated",
                    "cost": "Not recorded",
                    "priority": "High" if airdrop["status"] == AirdropStatus.CLAIMABLE.value else "Normal",
                })

    return {
        "active_projects": sum(a["status"] not in {AirdropStatus.COMPLETED.value, AirdropStatus.ENDED.value} for a in airdrops),
        "profiles": len(profiles),
        "recommendations": recommendations,
        "latest_airdrops": airdrops[:3],
        "claims": claims,
        "wallets": [
            {
                "chain": profile.get("location") or "Saved wallet",
                "balance": "Not connected",
                "gas_spent": "Not tracked",
                "activity_count": activity_by_profile.get(profile["id"], 0),
            }
            for profile in profiles
        ],
        "scheduler": [],
        "planner": planner[:8],
        "discovery_projects": [
            {
                "name": airdrop["project_name"],
                "source": "Tracked",
                "website": airdrop["website"],
                "reward_type": airdrop["reward_type"],
                "score": next((item["score"] for item in recommendations if item["project_name"] == airdrop["project_name"]), 0),
                "description": f'{len(airdrop.get("tasks", []))} tracked task(s); status {airdrop["status"].lower()}.',
            }
            for airdrop in airdrops[:5]
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


@app.delete("/profiles/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(profile_id: int, current_user: User = Depends(get_current_user)) -> None:
    profile = database.get_profile_by_id(profile_id)
    if profile is None or profile["user_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not database.delete_profile_if_unused(profile_id):
        raise HTTPException(
            status_code=409,
            detail="Profiles with task history cannot be removed because their evidence must remain attributable.",
        )


@app.get("/tasks")
def get_tasks(current_user: User = Depends(get_current_user)) -> List[dict]:
    return database.get_tasks_by_user(current_user.id)


@app.post("/step")
def execute_step(execution: StepExecution, current_user: User = Depends(get_current_user)) -> dict:
    profile = database.get_profile_by_id(execution.profile_id)
    if profile is None or profile["user_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Profile not found")

    airdrop = database.get_airdrop_by_id(execution.airdrop_id)
    if airdrop is None or airdrop["user_id"] != current_user.id:
        raise HTTPException(status_code=404, detail="Airdrop not found")

    task = database.get_task_by_id(execution.task_id)
    if task is None or task["airdrop_id"] != execution.airdrop_id:
        raise HTTPException(status_code=404, detail="Task not found for airdrop")

    try:
        image, extension = evidence.decode_screenshot(execution.screenshot)
    except evidence.EvidenceValidationError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.detail) from exc

    screenshot_path = evidence.save_screenshot(
        image,
        extension,
        execution.airdrop_id,
        execution.profile_id,
    )
    try:
        progress_id = database.insert_progress(
            execution.profile_id,
            execution.task_id,
            ProgressStatus.DONE.value,
            str(screenshot_path),
        )
    except Exception:
        evidence.discard_screenshot(screenshot_path)
        raise

    asyncio.create_task(notifier.notify_airdrop_update(airdrop, str(screenshot_path)))

    return {"progress_id": progress_id, "screenshot_path": str(screenshot_path)}


@app.get("/notifications")
def get_notifications(current_user: User = Depends(get_current_user)) -> List[dict]:
    return database.get_notifications_by_user(current_user.id)


@app.get("/security/status")
def get_security_status(current_user: User = Depends(get_current_user)) -> dict:
    default_secret = SECRET_KEY == "development-only-change-me"
    checks = [
        {
            "id": "jwt-secret",
            "label": "JWT signing secret",
            "status": "warning" if default_secret else "pass",
            "detail": "Set AIP_SECRET_KEY before deployment." if default_secret else "Configured through the runtime environment.",
        },
        {
            "id": "cors",
            "label": "Browser origin policy",
            "status": "warning" if "*" in CORS_ORIGINS else "pass",
            "detail": "Wildcard browser access is enabled." if "*" in CORS_ORIGINS else f"Restricted to {len(CORS_ORIGINS)} configured origin(s).",
        },
        {
            "id": "wallet-custody",
            "label": "Wallet custody",
            "status": "pass",
            "detail": "The API stores public address metadata only and rejects private-key-shaped input.",
        },
        {
            "id": "evidence-retention",
            "label": "Evidence retention",
            "status": "pass",
            "detail": f"Completed-task screenshots are scheduled for cleanup after {CLEANUP_HOURS} hours.",
        },
    ]
    return {
        "environment": ENVIRONMENT,
        "checks": checks,
        "summary": {
            "passed": sum(item["status"] == "pass" for item in checks),
            "warnings": sum(item["status"] == "warning" for item in checks),
        },
    }


@app.post("/refresh")
def refresh_statuses(current_user: User = Depends(get_current_user)) -> Dict[str, str]:
    status_engine.refresh_statuses_for_user(current_user.id)
    return {"detail": "Status refresh started"}
