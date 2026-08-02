from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class ScheduledTask:
    name: str
    interval_minutes: int
    status: str


def get_scheduled_tasks() -> List[ScheduledTask]:
    return [
        ScheduledTask(name="Refresh discovery feed", interval_minutes=30, status="Enabled"),
        ScheduledTask(name="Update project scores", interval_minutes=60, status="Enabled"),
        ScheduledTask(name="Check claim reminders", interval_minutes=120, status="Enabled"),
    ]
