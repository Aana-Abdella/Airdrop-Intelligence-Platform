# 👤 User Guide

[Documentation](README.md) / User Guide

This guide is for people using the local web interface—not for developers calling the API directly.

> [!NOTE]
> The interface tracks campaign metadata and profile metadata. It does not connect a wallet, sign a transaction, launch Chrome, perform social actions, or guarantee an airdrop.

### Step 1 — Connect

1. Open <http://localhost:5173> after starting the backend and frontend.
2. On the sign-in screen, choose **Create an account**.
3. Enter a username and a password of at least eight characters.
4. Submit the form, then sign in with those credentials.
5. A successful sign-in opens **Overview**. The browser keeps the session token locally so a reload can restore your session.

To leave the workspace, use **Log out** in the application shell. A failed or expired API session also returns you to sign-in.

## 🏠 Dashboard

The **Overview** page loads `/airdrops` and `/dashboard` together. It contains:

| Area | What it represents |
|---|---|
| Active projects | Campaigns whose status is not `COMPLETED` or `ENDED` |
| Farming profiles | Your saved profile count |
| AI recommendations | Local deterministic scores and suggested actions, not a remote AI service |
| Upcoming claims | Campaigns with `CLAIMABLE` status or a claim link |
| Wallet overview | Profile-derived placeholder cards; current values say `Not connected` and `Not tracked` |
| Today’s plan | Remaining API-defined tasks, if any exist |
| Discovery feed | Your tracked campaigns labeled `Tracked` |
| Automation queue | Empty in the current primary dashboard response |
| Airdrop pipeline | Campaigns grouped into lifecycle columns |

The **Refresh data** action reloads dashboard and campaign data. It does not invoke the backend status-refresh endpoint.

> 📸 **Screenshot**
> `[Add dashboard screenshot here]`
>
> This is an intentional placeholder, not a claim that a screenshot is included in the repository.

## 👛 Wallet / Account

Open **Profiles** and select **Create profile**. Complete the required fields:

- email;
- wallet address or identifier; and
- Chrome debugging port.

You may also add Chrome profile name, X handle, Discord handle, IP/proxy label, location, and notes. Use non-sensitive test values for local work. The saved wallet field is text metadata only.

## 🎯 Airdrop Campaigns

Open **Airdrops** and select **Add campaign**.

### Step 2 — Configure

Enter:

1. **Project name** — the label shown on campaign cards;
2. **Website** — a valid HTTP(S) URL;
3. **Reward type** — the reward label shown in the pipeline;
4. **Deadline** — the date used for display and status calculations;
5. **Reward amount** — optional text;
6. **Claim link** — optional HTTP(S) URL; and
7. **Tasks** — optional task name, type, and detail rows for the campaign.

Task rows are optional. When present, they appear in the campaign card and in **Tasks** for user-scoped status monitoring. Evidence submission remains an API workflow.

### Step 3 — Start

Submit the form. The new campaign appears under **New** with status `NEW`. Open its website using the external-link icon when you want to inspect the project yourself.

> [!IMPORTANT]
> In the current interface, “start” means **start tracking the campaign**. Creating a campaign does not execute its tasks, open its website automatically, connect a wallet, or submit a transaction.

## 📊 Monitoring Activity

Use the dashboard pipeline and metric cards to review your saved records. Status columns are:

`NEW` → `ONGOING` → `COMPLETED` → `CLAIMABLE` → `ENDED`

The campaign cards include a status selector. The backend persists the selected status and schedules optional notifier work through FastAPI background tasks. A status value is local metadata—not proof that a chain or campaign provider verified the state. A claim link and deadline can also affect automatic evaluation.

The frontend does not currently expose task execution, progress submission, or screenshot-evidence controls. Those concepts exist in the API-level workflow described in [How It Works](how-it-works.md#5-progress-and-evidence).

## 📜 History

The **Tasks** and **Notifications** screens provide user-scoped activity views. Notification rows represent workflow events and do not confirm delivery by an external provider. The SQLite database retains application data until configured cleanup applies to eligible old completed-progress rows.

## ⚙️ User Settings

There is no separate user-settings page in the current frontend. Runtime settings belong to [Configuration](configuration.md), and account actions are limited to registration, sign-in, session restoration, and logout.

## 🤖 Running the Bot

The root [`bot.py`](../bot.py) process is a separate Telegram/Discord `/test` broadcaster. It is not started by the web UI and does not run campaign tasks. See the [Bot Guide](bot.md).

## 🛑 Stopping the Bot

Stop each local process with `Ctrl+C` in its terminal. This applies to the optional bot and to the web application processes:

- Uvicorn for the backend;
- Vite for the frontend; and
- `bot.py`, if you started the optional broadcaster.

## 🔎 Understanding Results

Treat every card as a view of locally stored or locally derived data. Verify deadlines, eligibility, wallet ownership, and claim instructions on the official project website before taking action. The application does not guarantee eligibility, reward delivery, safety, or profitability.

---

[← Getting Started](getting-started.md) · [Bot Guide →](bot.md)
