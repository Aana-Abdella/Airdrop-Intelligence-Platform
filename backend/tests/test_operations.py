import asyncio
from datetime import datetime, timezone

from fastapi import BackgroundTasks

from backend import main, notifier
from backend.models import User


def make_user() -> User:
    return User(id=42, username="operations-owner", created_at=datetime.now(timezone.utc))


def test_tasks_endpoint_delegates_to_user_scoped_store(monkeypatch):
    expected = [{"id": 1, "task_name": "Bridge", "status": "PENDING"}]
    captured = {}

    def get_tasks(user_id):
        captured["id"] = user_id
        return expected

    monkeypatch.setattr(main.database, "get_tasks_by_user", get_tasks)

    result = main.get_tasks(make_user())

    assert captured["id"] == 42
    assert result == expected


def test_notifications_endpoint_delegates_to_user_scoped_store(monkeypatch):
    expected = [{"id": 2, "platform": "discord", "message": "Updated"}]
    captured = {}

    def get_notifications(user_id):
        captured["id"] = user_id
        return expected

    monkeypatch.setattr(main.database, "get_notifications_by_user", get_notifications)

    result = main.get_notifications(make_user())

    assert captured["id"] == 42
    assert result == expected


def test_security_status_is_explicit_about_warnings(monkeypatch):
    monkeypatch.setattr(main, "SECRET_KEY", "development-only-change-me")
    monkeypatch.setattr(main, "CORS_ORIGINS", ["http://localhost:5173"])

    result = main.get_security_status(make_user())

    assert result["summary"]["warnings"] >= 1
    assert any(check["id"] == "wallet-custody" and check["status"] == "pass" for check in result["checks"])


def test_notification_workflow_records_event_before_best_effort_delivery(monkeypatch):
    captured = []

    async def no_op_delivery(message):
        captured.append(message)

    monkeypatch.setattr(notifier.database, "insert_notification", lambda airdrop_id, platform, message: captured.append((airdrop_id, platform, message)))
    monkeypatch.setattr(notifier, "send_discord_notification", no_op_delivery)
    monkeypatch.setattr(notifier, "send_telegram_notification", no_op_delivery)
    monkeypatch.setattr(notifier, "send_x_notification", lambda message: captured.append(message))

    asyncio.run(notifier.notify_airdrop_update({"id": 7, "project_name": "Example", "status": "ONGOING"}))

    audit_event = captured[0]
    assert audit_event[:2] == (7, "workflow")
    assert "Project: Example" in audit_event[2]
    assert len(captured) == 4


def test_refresh_statuses_uses_fastapi_background_tasks(monkeypatch):
    changed = [{"id": 7, "project_name": "Example", "status": "ONGOING"}]
    monkeypatch.setattr(main.status_engine, "refresh_statuses_for_user", lambda user_id: changed)
    background_tasks = BackgroundTasks()

    result = main.refresh_statuses(background_tasks, make_user())

    assert result == {"detail": "Status refresh completed; 1 campaign(s) updated"}
    assert len(background_tasks.tasks) == 1
    assert background_tasks.tasks[0].func is notifier.notify_airdrop_update
    assert background_tasks.tasks[0].args == (changed[0],)