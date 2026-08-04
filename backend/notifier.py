import os
from typing import Dict, Optional

import httpx

try:
    import tweepy
except ImportError:  # X notifications are optional; auth must not depend on them.
    tweepy = None

from .config import DISCORD_WEBHOOK_URL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET, X_API_KEY, X_API_SECRET, X_BEARER_TOKEN


async def send_discord_notification(message: str) -> None:
    if not DISCORD_WEBHOOK_URL:
        return

    payload = {"content": message}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            await client.post(DISCORD_WEBHOOK_URL, json=payload)
        except Exception:
            pass


async def send_telegram_notification(message: str) -> None:
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = {"chat_id": TELEGRAM_CHAT_ID, "text": message, "parse_mode": "Markdown"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            await client.post(url, json=data)
        except Exception:
            pass


def send_x_notification(message: str) -> None:
    if tweepy is None or not all([X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET]):
        return

    try:
        client = tweepy.Client(
            consumer_key=X_API_KEY,
            consumer_secret=X_API_SECRET,
            access_token=X_ACCESS_TOKEN,
            access_token_secret=X_ACCESS_TOKEN_SECRET,
        )
        client.create_tweet(text=message)
    except Exception:
        pass


async def notify_airdrop_update(airdrop: Dict[str, str], screenshot_path: Optional[str] = None) -> None:
    project = airdrop.get("project_name")
    status = airdrop.get("status")
    message_lines = [
        f"🚀 Airdrop Progress Update",
        f"Project: {project}",
        f"Status: {status}",
    ]
    if screenshot_path:
        message_lines.append("Screenshot attached")
    message = "\n".join(message_lines)

    await send_discord_notification(message)
    await send_telegram_notification(message)
    send_x_notification(message)
