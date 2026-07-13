"""
Stealth Airdrop Social Tracker & Executor
Dual-Platform Broadcaster (Telegram + Discord)

Initial task:
- /test command on Telegram broadcasts a 'Hello World' message
  to both the configured Telegram channel and Discord channel.
"""

import asyncio
import logging

import discord
from discord.ext import commands
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

import config

# Configure logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Discord Client Setup
# ---------------------------------------------------------------------------
intents = discord.Intents.default()
discord_bot = commands.Bot(command_prefix="!", intents=intents)


@discord_bot.event
async def on_ready():
    logger.info(f"Discord bot logged in as {discord_bot.user} (ID: {discord_bot.user.id})")


# ---------------------------------------------------------------------------
# Telegram Handlers
# ---------------------------------------------------------------------------
async def test_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """
    Telegram /test command.
    Broadcasts a test 'Hello World' message to both platforms.
    """
    await update.message.reply_text("Broadcasting test message to all channels...")
    await broadcast_airdrop(
        "🚀 *Hello World!*\n\n"
        "This is a test broadcast from your *Stealth Airdrop Tracker*.\n"
        "If you see this, the dual-poster is working correctly!"
    )


# ---------------------------------------------------------------------------
# Dual-Platform Broadcast
# ---------------------------------------------------------------------------
async def broadcast_airdrop(content: str) -> None:
    """
    Sends a formatted message to the configured Telegram channel
    and Discord channel simultaneously.
    """
    # --- Telegram Broadcast ---
    try:
        await telegram_app.bot.send_message(
            chat_id=config.TELEGRAM_CHANNEL_ID,
            text=content,
            parse_mode="Markdown",
        )
        logger.info("Telegram broadcast succeeded.")
    except Exception as exc:
        logger.error(f"Telegram broadcast failed: {exc}")

    # --- Discord Broadcast ---
    try:
        channel = discord_bot.get_channel(config.DISCORD_CHANNEL_ID)
        if channel is not None:
            await channel.send(content)
            logger.info("Discord broadcast succeeded.")
        else:
            logger.error(
                "Discord broadcast failed: channel not found. "
                "Verify the DISCORD_CHANNEL_ID and bot permissions."
            )
    except Exception as exc:
        logger.error(f"Discord broadcast failed: {exc}")


# ---------------------------------------------------------------------------
# Main Entry Point
# ---------------------------------------------------------------------------
async def main() -> None:
    global telegram_app

    # Initialize Telegram Application
    telegram_app = (
        Application.builder()
        .token(config.TELEGRAM_BOT_TOKEN)
        .build()
    )
    telegram_app.add_handler(CommandHandler("test", test_command))

    # Start Discord bot in a background task
    discord_task = asyncio.create_task(discord_bot.start(config.DISCORD_BOT_TOKEN))

    # Start Telegram polling
    await telegram_app.initialize()
    await telegram_app.start()
    await telegram_app.updater.start_polling()
    logger.info("Telegram polling started. Bots are running.")

    # Keep the event loop alive
    try:
        while True:
            await asyncio.sleep(3600)
    except asyncio.CancelledError:
        pass
    finally:
        logger.info("Shutting down bots...")
        await telegram_app.updater.stop()
        await telegram_app.stop()
        await telegram_app.shutdown()
        await discord_bot.close()
        discord_task.cancel()
        try:
            await discord_task
        except asyncio.CancelledError:
            pass
        logger.info("Shutdown complete.")


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Interrupted by user.")

