import asyncio
from datetime import datetime
from typing import Dict, List, Optional

from . import database, notifier
from .models import AirdropStatus


def _parse_deadline(deadline: str) -> Optional[datetime]:
    try:
        return datetime.fromisoformat(deadline)
    except ValueError:
        return None


def _all_tasks_done_for_airdrop(airdrop: Dict[str, any]) -> bool:
    tasks = airdrop.get("tasks", [])
    if not tasks:
        return False

    progress_records = database.get_progress_by_airdrop(airdrop["id"])
    total_profiles = len(database.get_profiles_by_user(airdrop["user_id"]))
    if total_profiles == 0:
        return False

    task_ids = {task["id"] for task in tasks}
    completed = [p for p in progress_records if p["status"] == "DONE" and p["task_id"] in task_ids]
    return len(completed) >= len(task_ids) * total_profiles


def _any_progress_exists(airdrop: Dict[str, any]) -> bool:
    progress_records = database.get_progress_by_airdrop(airdrop["id"])
    return any(record["status"] != "PENDING" for record in progress_records)


def evaluate_airdrop_status(airdrop: Dict[str, any]) -> str:
    current_status = airdrop.get("status")
    deadline = _parse_deadline(airdrop.get("deadline", ""))
    claim_link = airdrop.get("claim_link")

    if current_status == AirdropStatus.CLAIMABLE and deadline and datetime.utcnow() > deadline:
        return AirdropStatus.ENDED
    if claim_link:
        return AirdropStatus.CLAIMABLE
    if current_status == AirdropStatus.NEW and _any_progress_exists(airdrop):
        return AirdropStatus.ONGOING
    if _all_tasks_done_for_airdrop(airdrop):
        return AirdropStatus.COMPLETED
    return current_status


def refresh_statuses_for_user(user_id: int) -> None:
    airdrops = database.get_airdrops_by_user(user_id)
    for airdrop in airdrops:
        new_status = evaluate_airdrop_status(airdrop)
        if new_status != airdrop["status"]:
            database.update_airdrop_status(airdrop["id"], new_status)
            asyncio.create_task(notifier.notify_airdrop_update({**airdrop, "status": new_status}))


async def schedule_status_updates(interval_hours: int = 12) -> None:
    while True:
        await asyncio.sleep(interval_hours * 3600)

