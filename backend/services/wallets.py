from __future__ import annotations

from dataclasses import dataclass
from typing import List


@dataclass
class WalletSummary:
    chain: str
    balance: float
    gas_spent: float
    activity_count: int


def get_wallet_summary() -> List[WalletSummary]:
    return [
        WalletSummary(chain="Ethereum", balance=1.42, gas_spent=0.08, activity_count=5),
        WalletSummary(chain="Arbitrum", balance=0.87, gas_spent=0.03, activity_count=3),
        WalletSummary(chain="Base", balance=0.41, gas_spent=0.01, activity_count=2),
    ]
