from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import List


@dataclass
class DiscoveryProject:
    name: str
    source: str
    website: str
    reward_type: str
    score: int
    description: str
    discovered_at: str


def fetch_discovery_projects() -> List[DiscoveryProject]:
    now = datetime.utcnow()
    return [
        DiscoveryProject(
            name="Galxe Campaign Pulse",
            source="Galxe",
            website="https://galxe.com",
            reward_type="Points",
            score=84,
            description="Community-driven campaign with strong momentum.",
            discovered_at=(now - timedelta(hours=2)).isoformat(),
        ),
        DiscoveryProject(
            name="Layer3 Quest Drop",
            source="Layer3",
            website="https://layer3.xyz",
            reward_type="Rewards",
            score=78,
            description="Interactive quests with ecosystem incentives.",
            discovered_at=(now - timedelta(hours=5)).isoformat(),
        ),
        DiscoveryProject(
            name="Zealy Sprint",
            source="Zealy",
            website="https://zealy.io",
            reward_type="Points",
            score=72,
            description="Task-based onboarding with active user participation.",
            discovered_at=(now - timedelta(hours=8)).isoformat(),
        ),
    ]
