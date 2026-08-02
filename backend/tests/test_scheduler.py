from backend.services.scheduler import get_scheduled_tasks


def test_get_scheduled_tasks_returns_jobs() -> None:
    tasks = get_scheduled_tasks()
    assert len(tasks) >= 3
    assert tasks[0].status == "Enabled"
