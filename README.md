# Airdrop Workflow System (AWS-lite)

A secure, full-stack application for managing cryptocurrency airdrop workflows with progress tracking, screenshot evidence, and safe reporting.

## Features

- **Authentication**: JWT-based login system with password hashing
- **Profile Management**: Create and manage unlimited airdrop farming identities
- **Workflow Tracking**: 5-phase lifecycle (NEW → ONGOING → COMPLETED → CLAIMABLE → ENDED)
- **Screenshot System**: Automatic evidence capture for each task step
- **Safe Reporting**: Clean notifications to Telegram, Discord, and X (Twitter)
- **Database Cleanup**: Automatic removal of old records after 72 hours
- **Scalable Design**: Supports unlimited profiles and dynamic workflows

## Tech Stack

- **Backend**: FastAPI + SQLite + JWT authentication
- **Frontend**: React + Vite + TailwindCSS + React Router
- **Automation**: Playwright (assisted mode only)
- **Notifications**: Telegram Bot API + Discord Webhook + X API

## Project Structure

```
backend/
  main.py              # FastAPI app with auth endpoints
  database.py          # SQLite helpers and user-specific data
  models.py            # Pydantic models for auth and workflows
  auth.py              # JWT authentication utilities
  notifier.py          # Safe posting to social platforms
  status_engine.py     # Workflow status automation
  profile_manager.py   # Profile and screenshot handling
  config.py            # Environment configuration
  requirements.txt     # Backend dependencies

frontend/
  src/
    App.jsx           # Main app with routing and auth
    components/
      Login.jsx       # Authentication component
      Dashboard.jsx   # Main workflow dashboard
      ProfileManager.jsx # Profile CRUD interface
    index.css         # Tailwind styles
  package.json        # Frontend dependencies

screenshots/           # Evidence storage (auto-cleaned)
```

## Setup

### Backend

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Configure environment in `backend/config.py`:
   - `SECRET_KEY`: Change for production
   - `DISCORD_WEBHOOK_URL`
   - `TELEGRAM_BOT_TOKEN` & `TELEGRAM_CHAT_ID`
   - `X_API_KEY`, `X_API_SECRET`, etc. (for X posting)

3. Start the backend:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Install Node dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the app at `http://localhost:5173`

## Usage

1. **Register/Login**: Create an account or sign in
2. **Manage Profiles**: Add farming identities (email, wallet, chrome port)
3. **Create Airdrops**: Add projects with tasks and deadlines
4. **Track Progress**: Execute steps, capture screenshots, update status
5. **Receive Notifications**: Get safe updates on Telegram/Discord/X

## Security Notes

- All sensitive data (passwords, tokens) are hashed/encrypted
- No wallet private keys or API secrets stored
- Screenshots contain only task evidence, no sensitive info
- JWT tokens required for all API access
- Database records auto-cleaned after 72 hours

## API Endpoints

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Get JWT token
- `GET /auth/me` - Get user info

### Profiles
- `GET /profiles` - List user profiles
- `POST /profiles` - Create new profile

### Airdrops
- `GET /airdrops` - Get user's airdrops grouped by status
- `POST /airdrops` - Create new airdrop
- `PATCH /airdrops/{id}/status` - Update status

### Workflow
- `POST /step` - Execute workflow step with screenshot
- `GET /notifications` - Get posting history
- `POST /refresh` - Manual status refresh

## Workflow Phases

1. **NEW**: Airdrop discovered, not started
2. **ONGOING**: Tasks in progress
3. **COMPLETED**: All tasks done, waiting for claim
4. **CLAIMABLE**: Claim link available
5. **ENDED**: Claimed or expired

## Posting Safety

Messages contain ONLY:
- Project name
- Task progress
- Status updates
- Screenshot attachments

NEVER posts:
- Wallet balances
- Private keys
- Login credentials
- API tokens
- Sensitive emails

## Scalability

- Unlimited profiles per user
- Dynamic task creation
- Automatic database cleanup
- Horizontal scaling ready

