# 🌐 Networks and Data Sources

[Documentation](README.md) / Networks

## Current network boundary

The checked-in application has **no live blockchain network integration**. A profile can store a wallet address as text, but the system does not validate ownership, connect a wallet provider, query RPC nodes, retrieve balances, estimate gas, index activity, or sign/send transactions.

## Where network names appear

| Name | Location | Classification |
|---|---|---|
| Ethereum | `backend/services/wallets.py` | Static sample summary |
| Arbitrum | `backend/services/wallets.py` | Static sample summary |
| Base | `backend/services/wallets.py` | Static sample summary |

These service results support helper tests and are not used as live data by the primary dashboard. Dashboard wallet cards are generated from saved profiles and report `Not connected` and `Not tracked` values.

## Discovery source names

| Source | Location | Classification |
|---|---|---|
| Galxe | `backend/services/discovery.py` | Sample fixture label |
| Layer3 | `backend/services/discovery.py` | Sample fixture label |
| Zealy | `backend/services/discovery.py` | Sample fixture label |
| `example-*.invalid` URLs | `backend/scraper.py` | Explicit placeholder sources |

The dashboard discovery feed does not call these providers. It reflects the authenticated user's tracked campaigns with source `Tracked`.

## Not implemented

- wallet connection or signature requests;
- private-key or seed-phrase handling;
- RPC clients or chain indexers;
- token/NFT balance queries;
- transaction simulation, signing, broadcast, or confirmation;
- bridge, swap, staking, minting, or claim execution;
- live Galxe, Layer3, Zealy, or other campaign ingestion.

> [!WARNING]
> Never add a private key or seed phrase to configuration to “enable” network support. There is no checked-in feature that needs either secret.

## Future integration requirements

Any network/source integration should be introduced as a separately reviewed capability with explicit user consent, supported-chain documentation, threat modeling, provider timeouts/rate limits, response validation, and tests. Read-only indexing should remain isolated from signing, and signing should never be added implicitly to profile storage.

---

[← Backend](backend.md) · [Security →](security.md)
