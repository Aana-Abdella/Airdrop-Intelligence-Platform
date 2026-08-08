# 📚 Documentation

> Everything you need to install, configure, use, understand, and contribute to the Airdrop Intelligence Platform.

<p align="center">
  <a href="getting-started.md"><strong>Get started</strong></a> ·
  <a href="user-guide.md"><strong>Use the workspace</strong></a> ·
  <a href="architecture.md"><strong>Explore the architecture</strong></a> ·
  <a href="contributing.md"><strong>Contribute</strong></a>
</p>

<p align="center">
  <img alt="Backend: FastAPI" src="https://img.shields.io/badge/backend-FastAPI-009688">
  <img alt="Frontend: React and Vite" src="https://img.shields.io/badge/frontend-React%20%2B%20Vite-646CFF">
  <img alt="Storage: SQLite" src="https://img.shields.io/badge/storage-SQLite-07405E">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-2563EB">
</p>

---

## 🚀 Start here

The project is a local-first FastAPI and React workspace for user-owned farming profiles, manually tracked airdrop campaigns, task metadata, progress evidence, lifecycle statuses, and optional notifications.

> [!IMPORTANT]
> **Know the project boundary.** Wallet addresses are stored as profile metadata. The checked-in application does not connect wallets, read balances, sign transactions, execute on-chain actions, or provide a guaranteed live multi-chain feed.

> [!NOTE]
> The repository contains **two separate runtime paths**:
>
> 1. the FastAPI + React workflow application; and
> 2. the root [`bot.py`](../bot.py) Telegram/Discord `/test` broadcaster.
>
> The broadcaster is not the workflow engine. See the [Bot Guide](bot.md).

## Documentation map

### 🚀 Get Started

| Guide | What you will learn |
|---|---|
| [🚀 Introduction](introduction.md) | Purpose, audience, shipped capabilities, and philosophy |
| [⚡ Getting Started](getting-started.md) | Install and run the API, interface, and optional broadcaster |
| [⚙️ Configuration](configuration.md) | Runtime values, local defaults, and secret-safe setup |
| [⚙️ How It Works](how-it-works.md) | End-to-end data and status workflow |

### 👤 For Users

| Guide | What you will learn |
|---|---|
| [👤 User Guide](user-guide.md) | Register, create profiles, track campaigns, and read the dashboard |
| [📊 Dashboard](user-guide.md#-dashboard) | Interpret metrics, recommendations, claims, plans, and pipeline cards |
| [🎯 Airdrop Farming & Tracking](user-guide.md#-airdrop-campaigns) | Record campaigns and manage lifecycle status; no farming action is executed automatically |
| [🤖 Bot Guide](bot.md) | Configure and run the separate dual-platform test broadcaster |
| [🛠️ Troubleshooting](troubleshooting.md) | Resolve common installation, auth, database, and integration issues |
| [❓ FAQ](faq.md) | Find concise answers about project scope and behavior |

### 👨‍💻 For Developers

| Guide | What you will learn |
|---|---|
| [🏗️ Architecture](architecture.md) | Components, trust boundaries, persistence, and runtime flows |
| [🖥️ Frontend](frontend.md) | React routes, components, API client, and build workflow |
| [⚙️ Backend](backend.md) | FastAPI endpoints, domain models, status engine, and services |
| [🌐 Networks](networks.md) | What network-related data exists—and what does not |
| [🤝 Contributing](contributing.md) | Development workflow, tests, documentation standards, and PR checklist |

### 🔐 Security

| Guide | Focus |
|---|---|
| [🔐 Security Guide](security.md) | Secrets, JWT configuration, browser storage, evidence, and third parties |

### 📜 Project

| Guide | Focus |
|---|---|
| [🗺️ Roadmap](roadmap.md) | Clearly labeled future opportunities—not shipped promises |
| [📜 Changelog](changelog.md) | Documentation and project history available in this repository |
| [⚖️ License](../LICENSE) | Canonical MIT license text |

## Capability legend

The guides use these labels to prevent prototypes from being mistaken for production integrations.

| Label | Meaning |
|---|---|
| **Shipped** | Connected to the current FastAPI or React application |
| **Helper** | Implemented utility code, but not wired into the primary UI/runtime flow |
| **Sample** | Deterministic fixture/foundation data used by modules or tests |
| **Roadmap** | Proposed direction only |

## Quick verification

After completing the [setup guide](getting-started.md), verify the application at:

| Service | Local URL |
|---|---|
| Web interface | <http://localhost:5173> |
| API root | <http://localhost:8000> |
| Interactive API docs | <http://localhost:8000/docs> |
| OpenAPI schema | <http://localhost:8000/openapi.json> |

## Support and safety

- Start with [Troubleshooting](troubleshooting.md) for operational failures.
- Use [Contributing](contributing.md) for reproducible bug reports.
- Follow [Security](security.md) for responsible vulnerability reporting.
- Never post a private key, seed phrase, password, bearer token, bot token, webhook URL, database file, or private screenshot in an issue.

---

<p align="center">
  <a href="../README.md">Project README</a> ·
  <a href="introduction.md">Next: Introduction →</a>
</p>
