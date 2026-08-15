from datetime import datetime, timezone

import pytest
from fastapi import HTTPException

from backend import main
from backend.models import AirdropCreate, AirdropStatus, TaskItem, TaskType, User


def make_user() -> User:
    return User(id=42, username="campaign-owner", created_at=datetime.now(timezone.utc))


def make_airdrop() -> AirdropCreate:
    return AirdropCreate(
        project_name="Example Protocol",
        website="https://example.com",
        reward_type="Points",
        reward_amount="10,000 points",
        deadline="2026-09-01T12:00:00Z",
        claim_link="https://claim.example.com",
        tasks=[TaskItem(task_name="Join community", task_type=TaskType.DISCORD)],
    )


def test_create_airdrop_assigns_authenticated_owner(monkeypatch):
    captured = {}

    def insert_airdrop(user_id, payload, tasks):
        captured.update(user_id=user_id, payload=payload, tasks=tasks)
        return 7

    created = {
        "id": 7,
        "user_id": 42,
        "project_name": "Example Protocol",
        "website": "https://example.com",
        "reward_type": "Points",
        "reward_amount": "10,000 points",
        "deadline": "2026-09-01T12:00:00+00:00",
        "status": "NEW",
        "claim_link": "https://claim.example.com",
        "created_at": "2026-08-08T16:00:00+00:00",
        "tasks": [{"task_name": "Join community", "task_type": "Discord"}],
    }
    monkeypatch.setattr(main.database, "insert_airdrop", insert_airdrop)
    monkeypatch.setattr(main.database, "get_airdrop_by_id", lambda airdrop_id: created)

    result = main.create_airdrop(make_airdrop(), make_user())

    assert result == created
    assert captured["user_id"] == 42
    assert captured["payload"]["status"] == AirdropStatus.NEW
    assert captured["payload"]["website"] == "https://example.com/"
    assert captured["payload"]["claim_link"] == "https://claim.example.com/"
    assert captured["tasks"] == [{"task_name": "Join community", "task_type": "Discord"}]


def test_create_airdrop_raises_when_created_record_is_missing(monkeypatch):
    monkeypatch.setattr(main.database, "insert_airdrop", lambda user_id, payload, tasks: 99)
    monkeypatch.setattr(main.database, "get_airdrop_by_id", lambda airdrop_id: None)

    with pytest.raises(HTTPException) as exc_info:
        main.create_airdrop(make_airdrop(), make_user())

    assert exc_info.value.status_code == 500
    assert exc_info.value.detail == "Unable to create airdrop"


def test_discover_airdrops_marks_only_users_started_campaigns(monkeypatch):
    monkeypatch.setattr(
        main.database,
        "get_airdrops_by_user",
        lambda user_id: [{"catalog_id": "galxe-community-pulse"}] if user_id == 42 else [],
    )

    result = main.discover_airdrops(make_user())

    assert len(result) >= 4
    assert {item["participation_types"][0] for item in result} >= {
        "Social tasks",
        "Wallet activity",
        "Early access",
        "Testnet",
    }
    assert next(item for item in result if item["id"] == "galxe-community-pulse")["is_started"] is True
    assert next(item for item in result if item["id"] == "layer3-ecosystem-quests")["is_started"] is False


def test_start_discovered_airdrop_creates_ongoing_user_campaign(monkeypatch):
    captured = {}

    def insert_airdrop(user_id, payload, tasks):
        captured.update(user_id=user_id, payload=payload, tasks=tasks)
        return 73

    monkeypatch.setattr(main.database, "get_airdrop_by_catalog_id", lambda user_id, catalog_id: None)
    monkeypatch.setattr(main.database, "insert_airdrop", insert_airdrop)
    monkeypatch.setattr(main.database, "get_airdrop_by_id", lambda airdrop_id: {"id": airdrop_id})

    result = main.start_discovered_airdrop("intract-testnet-missions", make_user())

    assert result == {"id": 73}
    assert captured["user_id"] == 42
    assert captured["payload"]["status"] == AirdropStatus.ONGOING.value
    assert captured["payload"]["catalog_id"] == "intract-testnet-missions"
    assert captured["payload"]["participation_types"] == ["Testnet", "Wallet activity"]
    assert any(task["task_type"] == "Testnet" for task in captured["tasks"])


def test_start_discovered_airdrop_rejects_duplicate(monkeypatch):
    monkeypatch.setattr(main.database, "get_airdrop_by_catalog_id", lambda user_id, catalog_id: {"id": 73})

    with pytest.raises(HTTPException) as exc_info:
        main.start_discovered_airdrop("galxe-community-pulse", make_user())

    assert exc_info.value.status_code == 409
    assert exc_info.value.detail == "Airdrop already started"