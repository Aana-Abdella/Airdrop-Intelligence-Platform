# 🚀 Airdrop Intelligence Platform

<p align="center">
  <strong>A modern workspace for organizing airdrop campaigns, farming profiles, task progress, evidence, and status workflows.</strong>
</p>

<p align="center">
  <a href="docs/README.md">📚 Documentation</a> ·
  <a href="docs/getting-started.md">⚡ Getting Started</a> ·
  <a href="docs/architecture.md">🏗️ Architecture</a> ·
  <a href="docs/contributing.md">🤝 Contributing</a>
</p>

<p align="center">
  <img alt="Backend" src="https://img.shields.io/badge/backend-FastAPI-009688">
  <img alt="Frontend" src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-646CFF">
  <img alt="Database" src="https://img.shields.io/badge/database-SQLite-07405E">
  <img alt="License" src="https://img.shields.io/badge/license-MIT-blue.svg">
</p>

## ✨ What it is

Airdrop Intelligence Platform is a FastAPI + React application for keeping airdrop operations in one user-scoped workspace. It supports JWT authentication, farming-profile records, campaign and task tracking, screenshot-backed progress, lifecycle status changes, dashboard summaries, and optional status notifications.

It also contains a separate root `bot.py` Telegram/Discord `/test` broadcaster. See the [Bot Guide](docs/bot.md) before treating it as part of the workflow application.

> ⚠️ **Scope** Wallet fields are metadata; there is no wallet connection, private-key handling, transaction signing, or guaranteed live multi-chain feed. Some intelligence, discovery, claim, planner, scheduler, and wallet service modules contain sample or application-derived foundation data.

## 🌟 Highlights

- 🔐 Username/password registration with bcrypt hashing and JWT bearer sessions.
- 👤 Profiles for email, wallet address, Chrome debugging details, social handles, location, proxy label, and notes.
- 🎯 Campaign columns: `NEW`, `ONGOING`, `COMPLETED`, `CLAIMABLE`, and `ENDED`.
- 📸 Screenshot bytes stored as progress evidence by campaign and profile.
- 📊 Dashboard metrics, recommendations, claim entries, planner entries, and tracked discovery cards.
- 📣 Optional Telegram, Discord webhook, and X/Twitter status notifications.

## ⚡ Quick start

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The complete setup, configuration, broadcaster, testing, and security guidance is in the **[documentation hub](docs/README.md)**.

## 🧪 Checks

```bash
python -m pytest backend/tests -q
cd frontend && npm run build
```

## 🗂️ Repository map

| Path | Role |
|---|---|
| `backend/` | FastAPI API, auth, SQLite persistence, services, and tests |
| `frontend/` | React/Vite interface |
| `bot.py` | Separate Telegram/Discord test broadcaster |
| `config.py` | Root broadcaster configuration placeholders |
| `docs/` | Premium project documentation system |
| `HOW_IT_WORKS.md` | Legacy overview; see `docs/how-it-works.md` |

## 📚 Documentation

Start at [📚 Documentation](docs/README.md), then choose:

- [Introduction](docs/introduction.md)
- [Getting Started](docs/getting-started.md)
- [Configuration](docs/configuration.md)
- [User Guide](docs/user-guide.md)
- [Backend](docs/backend.md) · [Frontend](docs/frontend.md)
- [Security](docs/security.md) · [Troubleshooting](docs/troubleshooting.md)
- [Roadmap](docs/roadmap.md) · [Changelog](docs/changelog.md)

## ⚠️ Disclaimer

This software is provided for workflow organization and experimentation. It does not guarantee airdrop eligibility, rewards, campaign availability, account safety, or financial outcomes. Verify third-party campaigns independently and use only accounts and credentials you are authorized to operate.

## ⚖️ License

[MIT License](LICENSE) © 2026 Aana Abdella.
