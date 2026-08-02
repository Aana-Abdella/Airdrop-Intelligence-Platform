from backend.services.planner import get_daily_plan


def test_get_daily_plan_returns_tasks() -> None:
    tasks = get_daily_plan()
    assert len(tasks) >= 4
    assert tasks[0].priority in {"High", "Medium"}
