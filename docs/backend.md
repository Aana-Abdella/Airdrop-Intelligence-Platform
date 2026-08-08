# ⚙️ Backend

[Documentation](README.md) / Backend

The backend is a FastAPI application exposed as `backend.main:app`. It uses Pydantic models, bearer-token dependencies, direct `sqlite3` queries, local evidence storage, and best-effort outbound notifier adapters.

## Run locally

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

- Interactive docs: <http://localhost:8000/docs>
- OpenAPI schema: <http://localhost:8000/openapi.json>

## API surface

All routes except registration and login require `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/auth/register` | Create a unique user with a bcrypt password hash |
| `POST` | `/auth/login` | OAuth2 form login; return a JWT |
| `GET` | `/auth/me` | Resolve the current user |
| `GET` | `/airdrops` | List current-user campaigns grouped by status |
| `GET` | `/dashboard` | Derive current-user metrics and workspace panels |
| `POST` | `/airdrops` | Create a campaign and API-supplied tasks |
| `PATCH` | `/airdrops/{airdrop_id}/status` | Manually update an owned campaign status |
| `GET` | `/profiles` | List current-user profiles |
| `POST` | `/profiles` | Create a current-user profile |
| `POST` | `/step` | Intended evidence/progress submission; currently incomplete |
| `GET` | `/notifications` | List notification rows belonging to current-user campaigns |
| `POST` | `/refresh` | Evaluate current-user campaign statuses |

> [!CAUTION]
> `StepExecution` does not currently define the `airdrop_id` read by the `/step` handler. The route is not used by the frontend and should be treated as an incomplete API contract until model, ownership, task relationship, and tests are aligned.

## Persistence

`backend/database.py` creates and queries six tables:

| Table | Role |
|---|---|
| `users` | Username and hashed password |
| `profiles` | User-owned profile/wallet/browser/social metadata |
| `airdrops` | User-owned campaigns and lifecycle status |
| `tasks` | Campaign task definitions |
| `progress` | Profile/task state and screenshot path |
| `notifications` | Campaign/platform/message audit structure |

Startup also runs compatibility migrations that add missing legacy columns. The default database is `backend/aws.db`.

## Status engine

`backend/status_engine.py` calculates:

1. `ENDED` when the deadline has passed;
2. `CLAIMABLE` when a claim link exists;
3. `COMPLETED` when every task is `DONE` for every saved profile;
4. `ONGOING` when non-pending progress exists; otherwise
5. `NEW`.

`POST /refresh` applies this to one authenticated user's campaigns. The startup 12-hour loop currently contains a TODO and does not enumerate users.

## Dashboard services

The main dashboard combines current-user records with deterministic logic in `backend/main.py` and `backend/services/intelligence.py`. The recommendation score uses task completion, deadline urgency, and a local risk heuristic. It does not invoke an AI model.

### Supporting services

| Module | State | Notes |
|---|---|---|
| `services/intelligence.py` | **Shipped** | Used by `/dashboard` for local scoring |
| `services/claims.py` | **Sample** | Returns deterministic sample claim records in its own helper/test path |
| `services/discovery.py` | **Sample** | Returns sample Galxe/Layer3/Zealy records in its own helper/test path |
| `services/planner.py` | **Foundation** | Ranks supplied tasks; not the primary dashboard implementation |
| `services/scheduler.py` | **Sample** | In-memory job fixture; not a running worker |
| `services/wallets.py` | **Sample** | Static network summaries; not chain queries |
| `scraper.py` | **Prototype** | Placeholder URLs and generic Playwright selectors |
| `profile_manager.py` | **Helper** | Playwright CDP/screenshot functions; unwired to current routes/UI |

## Notifications and jobs

`backend/notifier.py` optionally sends status messages to Discord webhooks, Telegram Bot API, and X via Tweepy. Missing values disable an adapter; errors are swallowed. Current sends do not insert rows in `notifications`.

A daily cleanup task removes old `DONE` progress rows using `CLEANUP_HOURS`. It does not remove corresponding screenshot files.

## Testing

```bash
python -m pytest backend/tests -q
```

The suite covers campaign/dashboard behavior, migrations, intelligence, claims, discovery, planner, scheduler, and wallet helpers. New route behavior should include authentication, ownership, validation, and persistence tests.

---

[← Frontend](frontend.md) · [Networks →](networks.md)
