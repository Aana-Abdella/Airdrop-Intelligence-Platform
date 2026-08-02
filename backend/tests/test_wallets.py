from backend.services.wallets import get_wallet_summary


def test_get_wallet_summary_returns_network_entries() -> None:
    summaries = get_wallet_summary()
    assert len(summaries) >= 3
    assert summaries[0].chain in {"Ethereum", "Arbitrum", "Base"}
