# 🤖 Bot Guide

[Documentation](README.md) / Bot Guide

The root [`bot.py`](../bot.py) is a small, independent Telegram/Discord test broadcaster. It is not the airdrop-workflow engine used by the React interface.

## What it does

When running, the process:

1. starts Telegram polling;
2. registers the Telegram `/test` command;
3. replies to the sender with a test acknowledgement;
4. attempts to send the fixed test message to the configured Telegram channel; and
5. attempts to send the same fixed test message to the configured Discord channel.

It does not read SQLite, discover campaigns, execute tasks, connect wallets, sign transactions, or update dashboard records.

## Flow

### Conceptual product flow

The requested product shape can be summarized as follows:

```text
👤 User
   ↓
🖥️ Frontend
   ↓
⚙️ Backend
   ↓
🤖 Bot
   ↓
🌐 Blockchain / Services
```

This is a conceptual diagram, not a claim that the repository currently wires
these layers together end to end. The actual runtime boundaries are shown
below.

```text
Requested product layers, mapped to what is actually connected

👤 User
   ↓
🖥️ Frontend
   ↓
⚙️ Backend
   ├────► 🗄️ SQLite
   └────► 🌐 Optional Telegram / Discord / X notification services

   ✕ no backend-to-bot runtime connection

Root broadcaster workflow

👤 Telegram user
   │ /test
   ▼
🤖 bot.py ──► Telegram acknowledgement
   │
   ├────► 🌐 Telegram channel (configured destination)
   └────► 🌐 Discord channel (configured destination)

⛓️ Blockchain networks: not connected by either workflow
```

> [!IMPORTANT]
> The conceptual chain **User → Frontend → Backend → Bot → Blockchain / Services** is **not implemented** end to end. The diagram above keeps every requested product layer visible while marking the real runtime boundaries: the web app can call optional notification services, and `bot.py` can call Telegram and Discord, but neither path connects to a blockchain.

## Configure

Edit the root `config.py` locally with:

| Setting | Purpose |
|---|---|
| `TELEGRAM_BOT_TOKEN` | Telegram bot authentication |
| `TELEGRAM_CHANNEL_ID` | Telegram broadcast destination |
| `DISCORD_BOT_TOKEN` | Discord client authentication |
| `DISCORD_CHANNEL_ID` | Integer Discord channel destination |

> [!CAUTION]
> The checked-in file contains placeholders. Never commit real tokens or channel-sensitive configuration, and never paste them into a support request.

## Start and stop

Install the root dependency set, then run from the repository root:

```bash
python -m pip install -r requirements.txt
python bot.py
```

Send `/test` to the configured Telegram bot. Stop the process with `Ctrl+C`.

## Task execution

The only executable bot task is the Telegram `/test` command. It acknowledges the sender and calls `broadcast_airdrop()` with a fixed test message. Campaign tasks stored by the FastAPI application are not read or executed by this process.

## Logging

The process uses Python's standard `logging` module at `INFO` level. It logs startup readiness, successful sends, missing Discord channels, delivery exceptions, interruption, and shutdown.

## Error handling

Telegram and Discord sends have separate `try`/`except` blocks. A failure on one side is logged and does not itself prevent the other attempt. The Telegram command handler itself does not wrap the acknowledgement and broadcast call in an additional catch-all handler. If `Ctrl+C` interrupts the process, the main routine stops Telegram polling, closes both clients, cancels the Discord task, and logs completion.

The bot does not provide a durable queue, retry policy, delivery dashboard, or notification history for this test command.

## Supported functionality

| Capability | Status |
|---|---|
| Telegram long polling | Supported |
| Telegram `/test` command | Supported |
| Telegram channel broadcast | Supported when configured and permitted |
| Discord channel broadcast | Supported when configured, cached, and permitted |
| Campaign task execution | Not supported |
| Wallet or blockchain operations | Not supported |

## Limitations

- `/test` is the only registered Telegram command.
- The message content is fixed in `bot.py`.
- There is no campaign/task scheduler in this process.
- There is no wallet or blockchain integration.
- It is separate from backend notifier settings in `backend/config.py`.

For the actual web workflow, start with [Getting Started](getting-started.md) and [How It Works](how-it-works.md).

---

[← User Guide](user-guide.md) · [Frontend →](frontend.md)
