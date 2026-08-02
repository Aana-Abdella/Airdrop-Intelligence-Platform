# Airdrop Intelligence Platform V2

Airdrop Intelligence Platform V2 is the upgraded version of the original workflow bot. It now functions as a more polished, production-oriented platform for discovering, analyzing, and managing crypto airdrop opportunities with AI-guided recommendations.

## What changed in V2

- Added an intelligence layer for project scoring and action recommendations
- Introduced a richer dashboard experience for platform-style monitoring
- Added a discovery feed foundation for seeded airdrop source candidates
- Added a claim center foundation with snapshot and claim reminders
- Added a wallet overview foundation with cross-chain balances and gas usage
- Added an automation queue foundation for scheduled refresh and reminder jobs
- Added a farming planner foundation with daily tasks, estimates, cost, and priority
- Preserved the existing authentication, profile management, and workflow flow
- Laid the groundwork for future PostgreSQL, Alembic, Redis, scheduler, and notification expansion

## Current capabilities

- JWT-based authentication and secure login flow
- Profile management for airdrop farming identities
- Workflow tracking across airdrop phases
- AI-assisted recommendations via project scoring
- Discovery feed for source candidates such as Galxe, Layer3, and Zealy
- Claim center reminders for snapshot and claim deadlines
- Wallet overview for balances, gas usage, and activity counts
- Automation queue for discovery refresh, scoring updates, and reminder checks
- Farming planner for daily tasks with estimates, cost, and priorities
- Modernized dashboard UI with a SaaS-style layout

## Tech stack

- Backend: FastAPI, SQLite, JWT, Pydantic
- Frontend: React, Vite, Tailwind CSS
- Intelligence: Python scoring and recommendation service
- Automation: Playwright-ready workflow foundation

## Project structure

```text
backend/
  main.py
  auth.py
  config.py
  database.py
  models.py
  profile_manager.py
  services/
    intelligence.py
  tests/
    test_intelligence.py
frontend/
  src/
    components/
      Dashboard.jsx
      Login.jsx
      ProfileManager.jsx
```

## Running locally

### Backend

1. Install dependencies:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```

2. Start the API:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the UI:
   ```bash
   npm run dev
   ```

## Next upgrade milestones

1. Replace SQLite with PostgreSQL and Alembic migrations
2. Add a full discovery engine for Galxe, Layer3, Zealy, TaskOn, and other sources
3. Build wallet, claim center, and farming planner modules
4. Add scheduler jobs, Redis caching, and notification integrations
5. Expand automated tests and deployment tooling

