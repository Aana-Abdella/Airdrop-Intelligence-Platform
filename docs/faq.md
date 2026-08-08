# ❓ FAQ

[Documentation](README.md) / FAQ

### What is this project?

It is a local-first FastAPI + React workspace for storing user-owned farming profiles, tracking airdrop campaign metadata, viewing derived dashboard panels, and managing campaign lifecycle statuses.

### Does it execute blockchain transactions?

No. The checked-in code does not connect wallets, sign transactions, submit claims, bridge assets, or require private keys or seed phrases.

### Is multi-chain support live?

No. Ethereum, Arbitrum, and Base appear in static helper data only. Wallet fields and dashboard wallet cards are not chain connections or balance queries.

### Are Galxe, Layer3, and Zealy live integrations?

No. They appear in sample discovery service data. The scraper contains placeholder URLs and is not a production feed. The primary dashboard displays tracked campaigns rather than polling those providers.

### What does “AI recommendations” mean?

It is the frontend label for a deterministic local scoring function. The current repository does not call an AI model or remote intelligence API.

### What can I do from the frontend?

You can register/sign in, create and list profiles, create campaigns, view the dashboard, and manually change campaign status. The UI does not expose task entry, progress submission, history, settings, notification history, or wallet connection.

### What is `bot.py`?

A separate Telegram/Discord test broadcaster. Its only registered command is `/test`, which replies to the sender and attempts a fixed message broadcast. It does not read application records or run airdrop tasks.

### Where is data stored?

SQLite defaults to `backend/aws.db`. The intended screenshot directory is `backend/screenshots`. Treat both as private application data.

### How are statuses calculated?

The status engine considers deadline, claim link, task completion across profiles, and progress. Authenticated `POST /refresh` is the reliable current-user refresh path. The UI's refresh button only reloads responses.

### Why is the automation queue empty?

The dashboard response currently returns an empty scheduler list. The repository contains a scheduler fixture/helper, but not a connected background job queue for the primary UI.

### Can I use this with real credentials?

Only after independently reviewing and hardening the deployment. Never use private keys or seed phrases; the application does not require them. Replace development JWT configuration and protect all notification credentials.

### How do I report a problem?

Open a focused issue with reproduction steps, expected and actual behavior, environment details, and sanitized logs. For security issues, follow [Security](security.md#responsible-reporting) and do not publish live secrets.

---

[← Troubleshooting](troubleshooting.md) · [Contributing →](contributing.md)
