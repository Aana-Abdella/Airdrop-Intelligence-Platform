# 📜 Changelog

[Documentation](README.md) / Changelog

This project does not currently provide a complete tagged release history. The entries below describe the checked-in baseline and documentation work without inventing release dates or version guarantees.

## Unreleased

### Documentation

- Added a structured `docs/` documentation hub and navigation system.
- Added installation, configuration, user, bot, frontend, backend, network, security, troubleshooting, FAQ, contribution, roadmap, and changelog guides.
- Added architecture, sequence, lifecycle, and troubleshooting diagrams.
- Documented the separation between the FastAPI/React application and root `/test` broadcaster.
- Labeled deterministic scoring, static services, placeholder scraper sources, Playwright helpers, and incomplete `/step` behavior accurately.
- Added secret-safe callouts and deployment/security boundaries.

## Current checked-in baseline

- FastAPI API with bcrypt password hashing and JWT bearer authentication.
- SQLite persistence for users, profiles, campaigns, tasks, progress, and notifications.
- React/Vite interface for authentication, dashboard, profile creation/listing, campaign creation, and status editing.
- Deterministic campaign recommendation scoring and derived dashboard panels.
- Optional best-effort Discord, Telegram, and X status notifier adapters.
- Separate root Telegram/Discord `/test` broadcaster.
- Pytest coverage for core campaign/dashboard paths, migrations, and supporting service modules.

> [!NOTE]
> Use Git history and future release tags as the authoritative source for code-level changes. This page should be updated when behavior or public documentation changes.

---

[← Roadmap](roadmap.md) · [License →](../LICENSE)
