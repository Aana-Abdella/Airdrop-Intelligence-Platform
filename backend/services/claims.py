from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List


@dataclass
class ClaimItem:
    project: str
    snapshot_date: str
    claim_date: str
    status: str
    reminder: str


def get_claim_queue() -> List[ClaimItem]:
    today = datetime.utcnow()
    return [
        ClaimItem(
            project="Layer3 Quest Drop",
            snapshot_date=(today - timedelta(days=3)).date().isoformat(),
            claim_date=(today + timedelta(days=7)).date().isoformat(),
            status="Upcoming",
            reminder="Remind 3 days before claim",
        ),
        ClaimItem(
            project="Galxe Campaign Pulse",
            snapshot_date=(today - timedelta(days=1)).date().isoformat(),
            claim_date=(today + timedelta(days=14)).date().isoformat(),
            status="Monitoring",
            reminder="Remind 5 days before claim",
        ),
    ]
