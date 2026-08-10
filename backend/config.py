import os
from pathlib import Path

# Backend configuration for Airdrop Workflow System.
# Values are read from the environment; see the repository .env.example.


def _csv_env(name: str, default: str) -> list[str]:
    return [value.strip() for value in os.getenv(name, default).split(",") if value.strip()]

# Auth
ENVIRONMENT = os.getenv("AIP_ENVIRONMENT", "development").lower()
SECRET_KEY = os.getenv("AIP_SECRET_KEY", "development-only-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("AIP_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
CORS_ORIGINS = _csv_env(
    "AIP_CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000",
)

# Notifications
DISCORD_WEBHOOK_URL = os.getenv("DISCORD_WEBHOOK_URL", "")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# X (Twitter) API
X_API_KEY = os.getenv("X_API_KEY", "")
X_API_SECRET = os.getenv("X_API_SECRET", "")
X_ACCESS_TOKEN = os.getenv("X_ACCESS_TOKEN", "")
X_ACCESS_TOKEN_SECRET = os.getenv("X_ACCESS_TOKEN_SECRET", "")
X_BEARER_TOKEN = os.getenv("X_BEARER_TOKEN", "")

# SQLite file path
DB_PATH = Path(os.getenv("AIP_DB_PATH", str(Path(__file__).parent / "aws.db"))).expanduser()

# Screenshot storage
SCREENSHOT_BASE = Path(
    os.getenv("AIP_SCREENSHOT_PATH", str(Path(__file__).parent / "screenshots"))
).expanduser()
SCREENSHOT_BASE.mkdir(parents=True, exist_ok=True)
MAX_SCREENSHOT_BYTES = int(os.getenv("AIP_MAX_SCREENSHOT_BYTES", str(5 * 1024 * 1024)))

# Cleanup settings
CLEANUP_HOURS = int(os.getenv("AIP_CLEANUP_HOURS", "72"))
