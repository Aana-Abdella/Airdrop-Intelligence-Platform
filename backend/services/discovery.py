from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List

from ..models import ParticipationType, TaskType


@dataclass
class DiscoveryProject:
    id: str
    name: str
    source: str
    website: str
    network: str
    reward_type: str
    reward_amount: str
    score: int
    description: str
    discovered_at: str
    deadline: str
    participation_types: List[str]
    tasks: List[dict]


def fetch_discovery_projects() -> List[DiscoveryProject]:
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    return [
        DiscoveryProject(
            id="galxe-community-pulse",
            name="Galxe Campaign Pulse",
            source="Galxe",
            website="https://galxe.com",
            network="Multi-chain",
            reward_type="Points",
            reward_amount="Campaign dependent",
            score=84,
            description="Community quests across emerging ecosystem campaigns.",
            discovered_at=(now - timedelta(hours=2)).isoformat(),
            deadline=(now + timedelta(days=45)).isoformat(),
            participation_types=[ParticipationType.SOCIAL_TASKS.value],
            tasks=[
                {"task_name": "Complete campaign social quests", "task_type": TaskType.SOCIAL.value},
                {"task_name": "Verify community membership", "task_type": TaskType.DISCORD.value},
            ],
        ),
        DiscoveryProject(
            id="layer3-ecosystem-quests",
            name="Layer3 Ecosystem Quests",
            source="Layer3",
            website="https://layer3.xyz",
            network="Multi-chain",
            reward_type="XP and rewards",
            reward_amount="Campaign dependent",
            score=78,
            description="Interactive ecosystem quests with wallet-based milestones.",
            discovered_at=(now - timedelta(hours=5)).isoformat(),
            deadline=(now + timedelta(days=60)).isoformat(),
            participation_types=[ParticipationType.WALLET_ACTIVITY.value, ParticipationType.SOCIAL_TASKS.value],
            tasks=[
                {"task_name": "Connect a public wallet", "task_type": TaskType.WALLET.value},
                {"task_name": "Complete an ecosystem quest", "task_type": TaskType.SOCIAL.value},
            ],
        ),
        DiscoveryProject(
            id="zealy-early-community",
            name="Zealy Early Community",
            source="Zealy",
            website="https://zealy.io",
            network="Off-chain",
            reward_type="Points",
            reward_amount="Community dependent",
            score=72,
            description="Early community registration and recurring social sprints.",
            discovered_at=(now - timedelta(hours=8)).isoformat(),
            deadline=(now + timedelta(days=30)).isoformat(),
            participation_types=[ParticipationType.EARLY_ACCESS.value, ParticipationType.SOCIAL_TASKS.value],
            tasks=[
                {"task_name": "Register for early community access", "task_type": TaskType.EARLY_ACCESS.value},
                {"task_name": "Complete the onboarding sprint", "task_type": TaskType.SOCIAL.value},
            ],
        ),
        DiscoveryProject(
            id="intract-testnet-missions",
            name="Intract Testnet Missions",
            source="Intract",
            website="https://www.intract.io",
            network="Multi-chain",
            reward_type="XP and roles",
            reward_amount="Mission dependent",
            score=81,
            description="Guided testnet missions with wallet and community actions.",
            discovered_at=(now - timedelta(hours=11)).isoformat(),
            deadline=(now + timedelta(days=50)).isoformat(),
            participation_types=[ParticipationType.TESTNET.value, ParticipationType.WALLET_ACTIVITY.value],
            tasks=[
                {"task_name": "Connect a test wallet", "task_type": TaskType.WALLET.value},
                {"task_name": "Complete available testnet missions", "task_type": TaskType.TESTNET.value},
            ],
        ),
        DiscoveryProject(
            id="guild-role-campaigns",
            name="Guild Role Campaigns",
            source="Guild",
            website="https://guild.xyz",
            network="Multi-chain",
            reward_type="Roles and access",
            reward_amount="Community dependent",
            score=75,
            description="Tokenless community roles based on social and wallet eligibility.",
            discovered_at=(now - timedelta(hours=14)).isoformat(),
            deadline=(now + timedelta(days=75)).isoformat(),
            participation_types=[ParticipationType.SOCIAL_TASKS.value, ParticipationType.WALLET_ACTIVITY.value],
            tasks=[
                {"task_name": "Check wallet eligibility", "task_type": TaskType.WALLET.value},
                {"task_name": "Join an eligible community role", "task_type": TaskType.DISCORD.value},
            ],
        ),
        DiscoveryProject(
            id="early-access-watchlist",
            name="Early Access Watchlist",
            source="Product waitlists",
            website="https://www.producthunt.com/topics/web3",
            network="Off-chain",
            reward_type="Early adopter status",
            reward_amount="Unconfirmed",
            score=68,
            description="A watchlist workflow for registering with new Web3 products early.",
            discovered_at=(now - timedelta(hours=18)).isoformat(),
            deadline=(now + timedelta(days=90)).isoformat(),
            participation_types=[ParticipationType.EARLY_ACCESS.value],
            tasks=[
                {"task_name": "Review the product and eligibility terms", "task_type": TaskType.EARLY_ACCESS.value},
                {"task_name": "Register for approved early access", "task_type": TaskType.EARLY_ACCESS.value},
            ],
        ),
    ]