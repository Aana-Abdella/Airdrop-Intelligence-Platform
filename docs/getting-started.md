# ⚡ Getting Started

[Documentation](README.md) / Getting Started

This guide starts the FastAPI backend and React frontend for local development. The independent root broadcaster is optional.

## 📋 Prerequisites

| Tool | Purpose | Check |
|---|---|---|
| Git | Clone the repository | `git --version` |
| Python 3 | Backend and broadcaster runtime | `python --version` |
| Node.js + npm | Frontend toolchain | `node --version && npm --version` |

Playwright's Chromium browser is only needed for the unwired profile/scraper helper paths—not for normal dashboard, profile, or campaign use.

## 📥 Clone the Repository

```bash
git clone https://github.com/AanaaAb1/Airdrop-tracker-bot.git
cd Airdrop-tracker-bot
```

## 🐍 Python Setup

```bash
python -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

## 📦 Install Dependencies

```bash
python -m pip install --upgrade pip
python -m pip install -r backend/requirements.txt
```

Root `requirements.txt` adds the Telegram/Discord broadcaster dependencies:

```bash
python -m pip install -r requirements.txt
```

Optional Playwright browser install:

```bash
python -m playwright install chromium
```

> [!NOTE]
> Install the Playwright browser only when working with the helper modules. The regular dashboard does not launch Playwright.

## 🔐 Environment Configuration

The frontend supports an optional Vite API URL:

```bash
cp frontend/.env.example frontend/.env
```

```dotenv
VITE_API_URL=http://localhost:8000
```

Backend values currently live in [`backend/config.py`](../backend/config.py), while root broadcaster values live in [`config.py`](../config.py). Review [Configuration](configuration.md) before setting any integration credential.

> [!TIP]
> Keep environment variables, bot tokens, webhook URLs, and configuration files containing real credentials private. Never commit secrets.

> [!IMPORTANT]
> Do not use real private keys or seed phrases in example configuration. The application does not require them.

## ▶️ Start the Backend

From the repository root:

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

The API creates or migrates `backend/aws.db` and prepares `backend/screenshots/` at startup. Check <http://localhost:8000/docs> for interactive API documentation.

## 🖥️ Start the Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

## 🤖 Start the Bot

The repository calls this process a bot, but it is an optional, independent `/test` broadcaster—not the campaign workflow engine. After configuring root [`config.py`](../config.py) with private Telegram and Discord values:

```bash
python bot.py
```

Send `/test` to the configured Telegram bot to verify its fixed test broadcast. Stop it with `Ctrl+C`.

## ✅ Verify Installation

### Application smoke test

1. Open <http://localhost:5173>.
2. Select **Create an account**.
3. Register with a test username and a password of at least eight characters.
4. Sign in and confirm the **Overview**, **Profiles**, **Airdrops**, **Tasks**, **Notifications**, and **Security** navigation items appear.
5. Create a profile using non-sensitive placeholder metadata.
6. Add a test campaign with a future deadline and confirm it appears under `NEW`.

### Automated checks

From the repository root:

```bash
python -m pytest backend/tests -q
```

Build the frontend in its own terminal or after stopping the dev server:

```bash
cd frontend
npm run build
```

## Stop services

Press `Ctrl+C` in each terminal running Uvicorn, Vite, or the optional broadcaster.

## Next steps

- [Configure runtime values](configuration.md)
- [Learn the user workflow](user-guide.md)
- [Review security responsibilities](security.md)
