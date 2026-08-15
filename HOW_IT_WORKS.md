# How this bot works (Airdrop-tracker-bot)

This project is a full-stack **airdrop workflow tracker** with:
- **Auth** (JWT)
- **Profiles** (multiple farming identities per user)
- **Airdrops** (projects with tasks + deadlines)
- **Progress tracking** with **screenshot evidence**
- **Status automation** (NEW → ONGOING → COMPLETED → CLAIMABLE → ENDED)
- **Safe notifications** to **Telegram**, **Discord**, and **X (Twitter)**

> Note: There are two “bot” concepts in this repo:
> 1) **The workflow tracker** (FastAPI backend + frontend).  
> 2) **`bot.py`** at the repo root (a small Telegram/Discord “test broadcast” bot).

---

## 1) System components

### Frontend (React)
- **`frontend/src/App.jsx`**: routes + login integration
- **`frontend/src/components/Login.jsx`**: authenticates user
- **`frontend/src/components/Dashboard.jsx`**: displays airdrops grouped by workflow status
- **`frontend/src/components/ProfileManager.jsx`**: CRUD for user profiles

### Backend (FastAPI)
Core files:
- **`backend/main.py`**: API server + scheduled background jobs
- **`backend/database.py`**: SQLite persistence layer
- **`backend/status_engine.py`**: workflow state transitions
- **`backend/notifier.py`**: posting notifications to Telegram/Discord/X
- **`backend/profile_manager.py`**: screenshot capture logic (Playwright)
- **`backend/scraper.py`**: discover/parse airdrops + tasks from external pages
- **`backend/models.py`**: Pydantic schemas + enums
- **`backend/auth.py`**: JWT helpers (used by `backend/main.py`)

### Database (SQLite)
Configured by `backend/config.py` as `AIP_DB_PATH`, defaulting to `backend/aws.db`.

Tables (created by `backend/database.py::create_tables()`):
- `users`
- `profiles`
- `airdrops`
- `tasks`
- `progress` (per profile/task completion + screenshot path)
- `notifications` (notification history)

---

## 2) Workflow lifecycle (statuses)

`backend/models.py` defines:
- **NEW**
- **ONGOING**
- **COMPLETED**
- **CLAIMABLE**
- **ENDED**

Transitions are computed by **`backend/status_engine.py::evaluate_airdrop_status()`** using:
- existing `airdrop.status`
- `airdrop.deadline`
- presence of `claim_link`
- whether there is meaningful progress (progress exists)
- whether *all tasks are done for all profiles*

High-level:
1. **NEW → ONGOING** when progress exists and status is still NEW.
2. **ONGOING → COMPLETED** when all tasks are marked DONE for all profiles.
3. **COMPLETED → CLAIMABLE** when `claim_link` exists.
4. **CLAIMABLE → ENDED** when `deadline` is reached.

---

## 3) End-to-end flow (what happens when you use the app)

### A) Register / Login
1. Frontend calls backend:
   - `POST /auth/register`
   - `POST /auth/login` (returns JWT)
2. Subsequent requests require JWT via `get_current_user`.

### B) Create Profiles
1. Frontend creates profiles through:
   - `GET /profiles` (list)
   - `POST /profiles` (create)
2. Each profile stores:
   - `email`, `wallet`, `chrome_port`, `notes`

Profiles allow the same airdrop to be tracked across multiple identities.

### C) Create an Airdrop (project + tasks)
1. Frontend calls:
   - `POST /airdrops`
2. Backend inserts:
   - one row into `airdrops`
   - multiple rows into `tasks`

`status` starts as **NEW**.

### D) Execute a step (capture evidence + mark progress)
1. When an authorized API client executes a task step, it calls:
   - `POST /step`
2. Backend does three things:
   1) **Validates ownership** of `execution.profile_id` for the current user
   2) **Writes screenshot bytes** to disk under:
      - `backend/config.py::SCREENSHOT_BASE / airdrop_id / profile_id / <timestamp>.png`
   3) **Inserts a progress record** into `progress`

3. Backend records a user-scoped workflow notification event and also triggers optional provider notifications:
   - FastAPI runs `notifier.notify_airdrop_update(...)` as a background task after the API response.

### E) Status refresh / automation
There are two ways status can advance:
1. **Manual refresh**:
   - `POST /refresh` → `status_engine.refresh_statuses_for_user(user_id)`
2. **Scheduled refresh scaffold** (background task started on FastAPI startup):
   - `backend/main.py` starts:
     - `status_engine.schedule_status_updates()` (currently sleeps every 12 hours but does not enumerate users or update campaigns)

When authenticated `POST /refresh` changes a status, the backend updates `airdrops.status` and schedules `notifier.notify_airdrop_update` through FastAPI background tasks.

### F) Cleanup (old records)
On startup, `backend/main.py` also schedules cleanup:
- periodically calls `database.cleanup_old_records(CLEANUP_HOURS)`
- currently configured in `backend/config.py` as **72 hours**

The cleanup removes corresponding in-root screenshot files when possible, then deletes `progress` rows for DONE items older than cutoff.

---

## 4) Notifications (Telegram / Discord / X)

Implemented in `backend/notifier.py`.

### Discord
- `DISCORD_WEBHOOK_URL` is used via an async HTTP POST (`httpx`).

### Telegram
- uses Telegram Bot API `sendMessage`
- target chat comes from `TELEGRAM_CHAT_ID`
- Markdown formatting is enabled

### X (Twitter)
- uses `tweepy.Client` and `create_tweet()`
- only runs if all required X credentials are present

### What the notifier posts
`notify_airdrop_update()` builds a short message with:
- Project name
- Current status
- (optional) note that a screenshot was attached

It does **not** post secrets/keys; it only posts status-level content.

Notification rows are workflow-event audit records. They do not confirm that Discord, Telegram, or X accepted a message. Provider credentials are optional and delivery failures are best-effort.

---

## 5) Screenshot capture evidence

There are two screenshot-related pathways in this codebase:

1. **Direct screenshot upload via API** (`POST /step`)
   - frontend sends screenshot bytes
   - backend writes them to `SCREENSHOT_BASE`

2. **Playwright-assisted capture**
   - `backend/profile_manager.py` contains `capture_screenshot()` and helpers
   - `backend/scraper.py` can also run Playwright in discovery

The exact UI integration depends on your frontend calls, but the evidence storage format is consistent:
- directory: `screenshots/<airdrop_id>/<profile_id>/`
- filename: timestamp-based `.png`

---

## 6) Scraping / discovery (optional automation)

`backend/scraper.py` provides:
- `discover_airdrops()` which:
  - visits predefined `SOURCES`
  - scrapes cards/items
  - extracts `project_name`, `website`, `deadline`, and a heuristic task list

It also provides:
- `classify_airdrop()` to filter descriptions
- `parse_tasks_from_text()` to detect task-type keywords

---

## 7) Repo root `bot.py` (test broadcaster)

This file is **not** the workflow engine.

What it does:
- on Telegram command `/test`, it broadcasts a **Hello World** message
- and sends the same message to Discord

This is helpful to verify your Telegram + Discord configuration quickly.

---

## 8) How to run (quick)

- Backend: `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`
- Frontend: from `frontend/`, run `npm install` then `npm run dev`

---

## 9) Configuration you must set

In environment variables (see [`.env.example`](.env.example) and [`docs/configuration.md`](docs/configuration.md)):
- `AIP_SECRET_KEY`, JWT settings
- `DISCORD_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`
- X credentials (`X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET`)

---

## Summary

**The user flow** is:
1) authenticate → 2) create profiles → 3) create airdrops + tasks → 4) execute steps (upload screenshot + mark DONE) → 5) status engine refreshes → 6) notifications are posted and stored.

