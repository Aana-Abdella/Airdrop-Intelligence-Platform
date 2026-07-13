from pathlib import Path

# Backend configuration for Airdrop Workflow System.
# Copy this file to `backend/.env` or set environment variables in production.

# Auth
SECRET_KEY = "your-secret-key-here-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Notifications
DISCORD_WEBHOOK_URL = ""
TELEGRAM_BOT_TOKEN = ""
TELEGRAM_CHAT_ID = ""

# X (Twitter) API
X_API_KEY = ""
X_API_SECRET = ""
X_ACCESS_TOKEN = ""
X_ACCESS_TOKEN_SECRET = ""
X_BEARER_TOKEN = ""

# SQLite file path
DB_PATH = Path(__file__).parent / "aws.db"

# Screenshot storage
SCREENSHOT_BASE = Path(__file__).parent / "screenshots"
SCREENSHOT_BASE.mkdir(parents=True, exist_ok=True)

# Cleanup settings
CLEANUP_HOURS = 72
