from backend.services.discovery import fetch_discovery_projects


def test_fetch_discovery_projects_returns_seeded_candidates() -> None:
    projects = fetch_discovery_projects()
    assert len(projects) >= 3
    assert projects[0].source in {"Galxe", "Layer3", "Zealy"}
    assert projects[0].score >= 70
