# 🚀 Introduction

Airdrop Intelligence Platform is a local-first operations workspace for tracking cryptocurrency airdrop campaigns and the work associated with them. It combines a FastAPI backend, a React/Vite interface, SQLite persistence, profile records, task progress, an incomplete screenshot-evidence endpoint, lifecycle statuses, and optional notifications.

## The problem

Airdrop research and execution can become scattered across spreadsheets, browser profiles, wallet notes, and chat reminders. This project gives that work a single user-scoped place to record campaigns, identities, deadlines, progress, and claim links.

## Who it is for

- Operators managing several campaigns and farming profiles.
- Developers exploring a small full-stack workflow application.
- Contributors extending the persistence, status, notification, or UI layers.

## ✨ Key Features

| Feature | What exists today |
|---|---|
| 🔐 Authentication | Username/password registration, bcrypt password hashing, and JWT bearer login. |
| 👤 Profiles | User-owned email, wallet, browser, social handle, location, proxy label, and notes records. |
| 🎯 Campaigns | Create and group campaigns by `NEW`, `ONGOING`, `COMPLETED`, `CLAIMABLE`, and `ENDED`. |
| 📸 Evidence endpoint | An authenticated `/step` route is present for screenshot/progress submission, but its current request model is incomplete and the route is not wired to the frontend. |
| 📊 Dashboard | User-scoped metrics, recommendations, claim entries, planner entries, and tracked discovery cards. |
| 📣 Notifications | Optional Telegram, Discord webhook, and X/Twitter status notifications. |
| 🤖 Broadcaster | Root `bot.py` provides a Telegram `/test` command that posts a Hello World message to configured Telegram and Discord destinations. |

> ℹ️ **Honest boundaries**  Wallet summaries, discovery cards, claim queue, planner, scheduler, and intelligence helpers include deterministic/sample or application-derived foundations. The repository does not currently implement wallet connection, transaction signing, seed-phrase handling, or a guaranteed live multi-chain data feed.

## High-level workflow

```text
Register → create profiles → add campaigns and tasks → record progress/evidence
        → refresh lifecycle status → review claims and optional notifications
```

## Project philosophy

- Prefer explicit, inspectable workflows over opaque automation.
- Keep user data isolated by ownership checks.
- Make integrations optional so missing notification credentials do not block the core app.
- Preserve backward-compatible SQLite migration behavior.
- Document current behavior clearly rather than implying future functionality is already live.
