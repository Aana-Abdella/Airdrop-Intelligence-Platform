from datetime import datetime, timezone

from backend import main
from backend.models import User


def make_user() -> User:
    return User(id=42, username="campaign-owner", created_at=datetime.now(timezone.utc))


def test_dashboard_derives_cards_from_authenticated_users_records(monkeypatch):
    airdrops = [{
        "id": 7,
        "user_id": 42,
        "project_name": "Example Protocol",
        "website": "https://example.com",
        "reward_type": "Points",
        "reward_amount": "10,000 points",
        "deadline": "2026-09-01T12:00:00Z",
        "status": "CLAIMABLE",
        "claim_link": "https://claim.example.com",
        "created_at": "2026-08-08T16:00:00+00:00",
        "tasks": [{"id": 11, "task_name": "Join community", "task_type": "Discord"}],
    }]
    profiles = [{"id": 3, "location": "Addis Ababa", "wallet": "0x123"}]
    progress = [{
        "profile_id": 3,
        "task_id": 11,
        "airdrop_id": 7,
        "status": "DONE",
    }]
    monkeypatch.setattr(main.database, "get_airdrops_by_user", lambda user_id: airdrops)
    monkeypatch.setattr(main.database, "get_profiles_by_user", lambda user_id: profiles)
    monkeypatch.setattr(main.database, "get_progress_by_user", lambda user_id: progress)

    result = main.get_dashboard(make_user())

    assert result["active_projects"] == 1
    assert result["profiles"] == 1
    assert result["claims"][0]["project"] == "Example Protocol"
    assert result["claims"][0]["website"] == "https://claim.example.com"
    assert result["recommendations"][0]["website"] == "https://example.com"
    assert result["wallets"] == [{
        "chain": "Addis Ababa",
        "balance": "Not connected",
        "gas_spent": "Not tracked",
        "activity_count": 1,
    }]
    assert result["planner"] == []
    assert result["scheduler"] == []
    assert result["discovery_projects"][0]["source"] == "Tracked"
    assert result["discovery_projects"][0]["website"] == "https://example.com"


def test_dashboard_is_empty_when_user_has_no_records(monkeypatch):
    monkeypatch.setattr(main.database, "get_airdrops_by_user", lambda user_id: [])
    monkeypatch.setattr(main.database, "get_profiles_by_user", lambda user_id: [])
    monkeypatch.setattr(main.database, "get_progress_by_user", lambda user_id: [])

    result = main.get_dashboard(make_user())

    assert result == {
        "active_projects": 0,
        "profiles": 0,
        "recommendations": [],
        "latest_airdrops": [],
        "claims": [],
        "wallets": [],
        "scheduler": [],
        "planner": [],
        "discovery_projects": [],
    }