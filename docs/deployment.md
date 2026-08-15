# Deployment

The production image packages the React frontend and FastAPI backend into one web service. FastAPI serves the compiled assets and JSON API from the same origin, so `VITE_API_URL` is not required for the standard deployment.

## Render Blueprint

1. Push this repository and the deployment files to GitHub.
2. In Render, choose **New > Blueprint** and select the repository.
3. Review the `airdrop-intelligence-platform` service from `render.yaml` and apply it.
4. Wait for `/health` to report a successful deploy, then open the service URL.

The Blueprint creates a generated `AIP_SECRET_KEY` and mounts a 1 GB persistent disk at `/data`. The SQLite database and screenshot evidence both live on that disk.

Add notification values in the Render service environment only when those integrations are needed:

```text
DISCORD_WEBHOOK_URL
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
X_API_KEY
X_API_SECRET
X_ACCESS_TOKEN
X_ACCESS_TOKEN_SECRET
X_BEARER_TOKEN
```

Do not set `VITE_API_URL` for this same-origin image. If the frontend is hosted separately, set it before the Docker build because Vite embeds the value at build time, and set `AIP_CORS_ORIGINS` to the exact frontend origin.

## Local Production Check

Docker Compose uses the same image and a persistent named volume:

```bash
export AIP_SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
docker compose up --build -d
curl --fail http://localhost:8000/health
```

Open `http://localhost:8000`, register an account, and verify that the dashboard loads. Stop the service without removing its data:

```bash
docker compose down
```

## Operational Constraints

- Run exactly one web process while SQLite is the database. The image intentionally starts Uvicorn with one worker.
- Keep `/data` on persistent storage. Deployments without a disk lose users, campaigns, and evidence on restart.
- Never use the development JWT secret in production. The backend refuses to start when `AIP_ENVIRONMENT=production` and the default secret is active.
- Back up both `/data/aip.db` and `/data/screenshots`. A database-only backup does not include task evidence.
- Check `GET /health` after each deployment. It should return `status: ok` and `environment: production`.

## Upgrades And Backups

Before a schema-changing release, create a consistent SQLite backup from a Render shell or any host running the image:

```bash
python -c 'import sqlite3; source=sqlite3.connect("/data/aip.db"); backup=sqlite3.connect("/data/aip-backup.db"); source.backup(backup); backup.close(); source.close()'
```

Keep a copy outside the service disk. Database migrations run automatically during application startup.

## Discord Bot

The Discord bot is optional and runs as a separate Node.js worker. Deploy it only after the web service has a stable public URL. Configure `AIP_API_URL` with that URL and provide `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_GUILD_ID`, `AIP_USERNAME`, and `AIP_PASSWORD` as worker secrets. See [bot.md](bot.md) for registration and runtime commands.