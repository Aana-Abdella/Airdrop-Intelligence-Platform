from datetime import datetime, timezone

from fastapi.testclient import TestClient

from backend import main
from backend.models import User


def test_browser_navigation_serves_spa_without_shadowing_api(monkeypatch, tmp_path):
    dist = tmp_path / "dist"
    (dist / "assets").mkdir(parents=True)
    (dist / "index.html").write_text("<html>deployment-shell</html>", encoding="utf-8")
    monkeypatch.setattr(main, "FRONTEND_DIST", dist)
    monkeypatch.setattr(main.database, "get_airdrops_by_user", lambda user_id: [])

    user = User(id=42, username="deployer", created_at=datetime.now(timezone.utc))
    main.app.dependency_overrides[main.get_current_user] = lambda: user
    client = TestClient(main.app)

    try:
        browser_response = client.get("/airdrops", headers={"Accept": "text/html"})
        api_response = client.get("/airdrops", headers={"Accept": "application/json"})
    finally:
        main.app.dependency_overrides.clear()

    assert browser_response.status_code == 200
    assert "deployment-shell" in browser_response.text
    assert api_response.status_code == 200
    assert api_response.json() == {
        "NEW": [],
        "ONGOING": [],
        "CLAIMABLE": [],
        "COMPLETED": [],
        "ENDED": [],
    }


def test_mount_frontend_exposes_built_assets(monkeypatch, tmp_path):
    dist = tmp_path / "dist"
    assets = dist / "assets"
    assets.mkdir(parents=True)
    (dist / "index.html").write_text("<html></html>", encoding="utf-8")
    (assets / "app.css").write_text("body { color: black; }", encoding="utf-8")
    monkeypatch.setattr(main, "FRONTEND_DIST", dist)

    application = main.FastAPI()

    assert main.mount_frontend(application) is True
    response = TestClient(application).get("/assets/app.css")
    assert response.status_code == 200
    assert response.text == "body { color: black; }"