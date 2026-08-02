from backend.services.intelligence import build_project_score, recommend_action


def test_build_project_score_aggregates_weights() -> None:
    score = build_project_score(
        funding=80,
        investors=70,
        community=75,
        activity=60,
        difficulty=40,
        cost=30,
        reward=90,
        risk=20,
        history=50,
    )

    assert score["total"] == 90
    assert score["breakdown"]["Funding"] == 24
    assert score["breakdown"]["Community"] == 11


def test_recommend_action_prefers_farm_for_strong_signal() -> None:
    recommendation = recommend_action(total_score=91, risk=20, cost=15)
    assert recommendation == "Farm"
