# ⚙️ Configuration

[Documentation](README.md) / Configuration

The repository has three configuration surfaces: the FastAPI module, the React build-time API origin, and the separate root broadcaster. The backend reads environment variables in `backend/config.py` and does **not** automatically load a `.env` file. Use your process manager, shell, container secret store, or a local untracked environment file to provide them.

## Configuration at a glance

| Runtime | File | Used by |
|---|---|---|
| Workflow API | `backend/config.py` | `backend/main.py`, auth, notifier, database, cleanup |
| React development server | `frontend/.env` | Vite and `frontend/src/api.js` |
| Telegram/Discord broadcaster | `config.py` | root `bot.py` only |

> [!IMPORTANT]
> The two bot/notifier paths are separate. Backend notification credentials do not configure the root `bot.py` broadcaster, and the root broadcaster does not read the application database.

## ⚙️ Backend settings

Set these values in the process environment. The checked-in defaults are intended for local development only.

| Setting | Current value | Effect |
|---|---|---|
| `AIP_SECRET_KEY` | Development placeholder | Signs and verifies JWTs; replace before any shared deployment |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `AIP_ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | JWT lifetime |
| `AIP_DB_PATH` | `backend/aws.db` | SQLite database location |
| `AIP_SCREENSHOT_PATH` | `backend/screenshots` | Screenshot evidence directory; created at import time |
| `AIP_MAX_SCREENSHOT_BYTES` | `5242880` | Maximum accepted screenshot size |
| `AIP_CLEANUP_HOURS` | `72` | Age threshold for deleting old `DONE` progress rows |

### Optional backend notifications

Empty values disable the corresponding adapter. The notifier currently supports:

| Values | Adapter | Required values |
|---|---|---|
| `DISCORD_WEBHOOK_URL` | Discord webhook | One webhook URL |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | Telegram Bot API | Both values |
| `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_TOKEN_SECRET` | X via Tweepy | All four values |
| `X_BEARER_TOKEN` | Reserved configuration value | Defined, but not used by the current notifier path |

Notifications are best-effort. Missing credentials disable an adapter. Workflow events are audited in the application database, but external delivery is neither queued nor confirmed. See [Security](security.md#third-party-notifications).

> [!CAUTION]
> Do not paste a real bot token, webhook URL, X credential, password, JWT secret, private key, seed phrase, or bearer token into documentation, issues, screenshots, or committed config.

## 🖥️ Frontend API origin

`frontend/src/api.js` reads `VITE_API_URL`. The default is `http://localhost:8000`. This is a public API origin, not a secret.

To use another local API origin:

```bash
cp frontend/.env.example frontend/.env
```

```dotenv
VITE_API_URL=http://localhost:8000
```

Restart Vite after changing a `VITE_` variable because it is embedded at build/dev-server startup. This value is not a secret.

## 🤖 Root broadcaster settings

The root `config.py` contains placeholders for:

| Setting | Type | Used by |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | String | Telegram polling and send |
| `TELEGRAM_CHANNEL_ID` | String | Fixed `/test` broadcast destination |
| `DISCORD_BOT_TOKEN` | String | Discord client login |
| `DISCORD_CHANNEL_ID` | Integer | Discord destination lookup |

The broadcaster expects a usable integer Discord channel ID and a Telegram channel identifier accepted by the Telegram library. Keep the file local and run `python bot.py` only after configuring values safely.

## 🌐 CORS and local origins

CORS is configured by `AIP_CORS_ORIGINS` in `backend/config.py` and accepts a comma-separated list. The development default contains common Vite origins and does not enable wildcard access. Before exposing the API beyond a trusted local environment, narrow the list to exact origins and review credentialed CORS behavior.

## Safe configuration checklist

- [ ] Replace the development JWT signing key outside local-only use.
- [ ] Keep `backend/aws.db` and any screenshot directory private.
- [ ] Use test-only accounts and placeholder wallet metadata locally.
- [ ] Provide only the notification credentials you actually need.
- [ ] Never add private keys or seed phrases; the checked-in workflow does not require them.
- [ ] Restart the relevant process after changing configuration.

---

[← Getting Started](getting-started.md) · [How It Works →](how-it-works.md)
