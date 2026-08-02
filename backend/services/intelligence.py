from __future__ import annotations

from typing import Dict, List


WEIGHTS = {
    "Funding": 0.30,
    "Investors": 0.15,
    "Community": 0.15,
    "Activity": 0.20,
    "Difficulty": 0.10,
    "Cost": 0.10,
    "Reward": 0.15,
    "Risk": 0.10,
    "History": 0.05,
}


def build_project_score(
    funding: int,
    investors: int,
    community: int,
    activity: int,
    difficulty: int,
    cost: int,
    reward: int,
    risk: int,
    history: int,
) -> Dict[str, object]:
    breakdown = {
        "Funding": round(funding * WEIGHTS["Funding"]),
        "Investors": round(investors * WEIGHTS["Investors"]),
        "Community": round(community * WEIGHTS["Community"]),
        "Activity": round(activity * WEIGHTS["Activity"]),
        "Difficulty": round(difficulty * WEIGHTS["Difficulty"]),
        "Cost": round(cost * WEIGHTS["Cost"]),
        "Reward": round(reward * WEIGHTS["Reward"]),
        "Risk": round(risk * WEIGHTS["Risk"]),
        "History": round(history * WEIGHTS["History"]),
    }
    total = sum(breakdown.values())
    return {"breakdown": breakdown, "total": total}


def recommend_action(total_score: int, risk: int, cost: int) -> str:
    if total_score >= 80 and risk <= 25 and cost <= 25:
        return "Farm"
    if total_score >= 60:
        return "Watch"
    return "Skip"
