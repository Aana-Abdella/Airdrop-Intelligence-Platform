from backend.services.claims import get_claim_queue


def test_get_claim_queue_returns_upcoming_claims() -> None:
    claims = get_claim_queue()
    assert len(claims) >= 2
    assert claims[0].status in {"Upcoming", "Monitoring"}
