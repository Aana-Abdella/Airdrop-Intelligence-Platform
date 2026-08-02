from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class PlannerTask:
    title: str
    estimate: str
    cost: str
    priority: str


def get_daily_plan() -> List[PlannerTask]:
    return [
        PlannerTask(title="Bridge funds", estimate="20 min", cost="$3-$8", priority="High"),
        PlannerTask(title="Swap tokens", estimate="15 min", cost="$2-$5", priority="Medium"),
        PlannerTask(title="Mint NFT", estimate="10 min", cost="Free", priority="Medium"),
        PlannerTask(title="Complete quest", estimate="25 min", cost="Free", priority="High"),
    ]
