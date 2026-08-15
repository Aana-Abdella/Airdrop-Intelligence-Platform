import base64
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi import BackgroundTasks, HTTPException

from backend import evidence, main
from backend.models import StepExecution, User


PNG_BYTES = b"\x89PNG\r\n\x1a\n" + b"test-image"


def make_user() -> User:
    return User(id=42, username="step-owner", created_at=datetime.now(timezone.utc))


def make_execution(**updates) -> StepExecution:
    values = {
        "profile_id": 3,
        "airdrop_id": 7,
        "task_id": 11,
        "screenshot": base64.b64encode(PNG_BYTES).decode("ascii"),
    }
    values.update(updates)
    return StepExecution(**values)


def configure_owned_records(monkeypatch) -> None:
    monkeypatch.setattr(main.database, "get_profile_by_id", lambda profile_id: {"id": profile_id, "user_id": 42})
    monkeypatch.setattr(
        main.database,
        "get_airdrop_by_id",
        lambda airdrop_id: {"id": airdrop_id, "user_id": 42, "project_name": "Example"},
    )
    monkeypatch.setattr(main.database, "get_task_by_id", lambda task_id: {"id": task_id, "airdrop_id": 7})


def test_execute_step_stores_validated_evidence_and_progress(monkeypatch, tmp_path):
    configure_owned_records(monkeypatch)
    monkeypatch.setattr(evidence, "SCREENSHOT_BASE", tmp_path)
    captured = {}

    def insert_progress(profile_id, task_id, status, screenshot_path):
        captured.update(
            profile_id=profile_id,
            task_id=task_id,
            status=status,
            screenshot_path=screenshot_path,
        )
        return 19

    monkeypatch.setattr(main.database, "insert_progress", insert_progress)

    result = main.execute_step(make_execution(), BackgroundTasks(), make_user())

    screenshot_path = Path(result["screenshot_path"])
    assert result["progress_id"] == 19
    assert screenshot_path.parent == tmp_path / "7" / "3"
    assert screenshot_path.suffix == ".png"
    assert screenshot_path.read_bytes() == PNG_BYTES
    assert captured == {
        "profile_id": 3,
        "task_id": 11,
        "status": "DONE",
        "screenshot_path": str(screenshot_path),
    }


@pytest.mark.parametrize("profile", [None, {"id": 3, "user_id": 99}])
def test_execute_step_hides_missing_or_foreign_profile(monkeypatch, profile):
    monkeypatch.setattr(main.database, "get_profile_by_id", lambda profile_id: profile)
    monkeypatch.setattr(
        main.database,
        "get_airdrop_by_id",
        lambda airdrop_id: pytest.fail("campaign lookup must not run after profile rejection"),
    )

    with pytest.raises(HTTPException) as exc_info:
        main.execute_step(make_execution(), BackgroundTasks(), make_user())

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Profile not found"


@pytest.mark.parametrize("airdrop", [None, {"id": 7, "user_id": 99}])
def test_execute_step_hides_missing_or_foreign_airdrop(monkeypatch, airdrop):
    monkeypatch.setattr(main.database, "get_profile_by_id", lambda profile_id: {"id": profile_id, "user_id": 42})
    monkeypatch.setattr(main.database, "get_airdrop_by_id", lambda airdrop_id: airdrop)
    monkeypatch.setattr(
        main.database,
        "get_task_by_id",
        lambda task_id: pytest.fail("task lookup must not run after campaign rejection"),
    )

    with pytest.raises(HTTPException) as exc_info:
        main.execute_step(make_execution(), BackgroundTasks(), make_user())

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Airdrop not found"


@pytest.mark.parametrize("task", [None, {"id": 11, "airdrop_id": 8}])
def test_execute_step_rejects_missing_or_unrelated_task(monkeypatch, task):
    configure_owned_records(monkeypatch)
    monkeypatch.setattr(main.database, "get_task_by_id", lambda task_id: task)
    monkeypatch.setattr(
        main.database,
        "insert_progress",
        lambda *args: pytest.fail("progress must not be written for an invalid task"),
    )

    with pytest.raises(HTTPException) as exc_info:
        main.execute_step(make_execution(), BackgroundTasks(), make_user())

    assert exc_info.value.status_code == 404
    assert exc_info.value.detail == "Task not found for airdrop"


@pytest.mark.parametrize(
    ("screenshot", "status_code", "detail"),
    [
        ("not base64!", 422, "Screenshot must be valid base64"),
        (base64.b64encode(b"plain text").decode("ascii"), 415, "Screenshot must be a PNG, JPEG, or WebP image"),
        (
            "data:image/jpeg;base64," + base64.b64encode(PNG_BYTES).decode("ascii"),
            415,
            "Screenshot data URL type does not match the image content",
        ),
    ],
)
def test_execute_step_rejects_invalid_screenshot(monkeypatch, tmp_path, screenshot, status_code, detail):
    configure_owned_records(monkeypatch)
    monkeypatch.setattr(evidence, "SCREENSHOT_BASE", tmp_path)
    monkeypatch.setattr(
        main.database,
        "insert_progress",
        lambda *args: pytest.fail("progress must not be written for invalid evidence"),
    )

    with pytest.raises(HTTPException) as exc_info:
        main.execute_step(make_execution(screenshot=screenshot), BackgroundTasks(), make_user())

    assert exc_info.value.status_code == status_code
    assert exc_info.value.detail == detail
    assert list(tmp_path.rglob("*")) == []


def test_execute_step_rejects_screenshot_over_configured_limit(monkeypatch):
    configure_owned_records(monkeypatch)
    monkeypatch.setattr(evidence, "MAX_SCREENSHOT_BYTES", len(PNG_BYTES) - 1)

    with pytest.raises(HTTPException) as exc_info:
        main.execute_step(make_execution(), BackgroundTasks(), make_user())

    assert exc_info.value.status_code == 413
    assert "MiB limit" in exc_info.value.detail


def test_execute_step_removes_evidence_when_progress_insert_fails(monkeypatch, tmp_path):
    configure_owned_records(monkeypatch)
    monkeypatch.setattr(evidence, "SCREENSHOT_BASE", tmp_path)
    monkeypatch.setattr(
        main.database,
        "insert_progress",
        lambda *args: (_ for _ in ()).throw(RuntimeError("database unavailable")),
    )

    with pytest.raises(RuntimeError, match="database unavailable"):
        main.execute_step(make_execution(), BackgroundTasks(), make_user())

    assert [path for path in tmp_path.rglob("*") if path.is_file()] == []


def test_cleanup_expired_progress_deletes_safe_evidence_and_database_rows(monkeypatch, tmp_path):
    monkeypatch.setattr(evidence, "SCREENSHOT_BASE", tmp_path / "screenshots")
    stored_file = evidence.SCREENSHOT_BASE / "7" / "3" / "stored.png"
    stored_file.parent.mkdir(parents=True)
    stored_file.write_bytes(PNG_BYTES)
    outside_file = tmp_path / "outside.png"
    outside_file.write_bytes(PNG_BYTES)
    records = [
        {"id": 1, "screenshot_path": str(stored_file)},
        {"id": 2, "screenshot_path": None},
        {"id": 3, "screenshot_path": str(outside_file)},
    ]
    deleted_ids = []
    monkeypatch.setattr(evidence.database, "get_expired_progress_records", lambda hours: records)
    monkeypatch.setattr(
        evidence.database,
        "delete_progress_records",
        lambda progress_ids: deleted_ids.extend(progress_ids) or len(progress_ids),
    )

    deleted = evidence.cleanup_expired_progress(72)

    assert deleted == 3
    assert deleted_ids == [1, 2, 3]
    assert not stored_file.exists()
    assert outside_file.exists()


def test_cleanup_retains_database_row_when_evidence_delete_fails(monkeypatch):
    monkeypatch.setattr(
        evidence.database,
        "get_expired_progress_records",
        lambda hours: [{"id": 1, "screenshot_path": "/failed/evidence.png"}],
    )
    monkeypatch.setattr(evidence, "discard_screenshot", lambda path: False)
    monkeypatch.setattr(
        evidence.database,
        "delete_progress_records",
        lambda progress_ids: pytest.fail("database row must remain when file deletion fails"),
    )

    assert evidence.cleanup_expired_progress(72) == 0