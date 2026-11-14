# MinuteMate

MinuteMate turns meeting discussions into evidence-linked task proposals that an organizer can review and approve before they are tracked.

## MVP boundary

The first release proves one workflow: enter a meeting transcript or notes, extract proposed tasks, validate their evidence and dates, review and approve them, then track approved tasks on a dashboard. Audio transcription is optional. Slack and Google Calendar are simulated in the MVP; live third-party connections are deferred.

## Requirements

- Node.js 20.9 or newer and npm
- Python 3.11 or newer
- Docker Desktop with Docker Compose, or a local PostgreSQL 16+ server
- Git

## Run locally on Windows

1. Copy `.env.example` to `backend/.env` and set `JWT_SECRET` and `OPENAI_API_KEY` when those features are added. The foundation does not call the AI API yet.
2. Start PostgreSQL with `docker compose up -d db`.
   The Compose database is published on port `5433` so it does not collide with the PostgreSQL service already installed on this computer at port `5432`.
3. In one terminal, start the API:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

4. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Open <http://localhost:3000>. The API health endpoint is <http://localhost:8000/health> and the OpenAPI page is <http://localhost:8000/docs>.

## Project layout

- `frontend/` — Next.js App Router interface
- `backend/` — FastAPI application and service layers
- `database/` — schema and safe demo seed data
- `docs/` — architecture, API, database, testing, and demo notes
- `scripts/` — repeatable local setup helpers

See `docs/architecture.md` and `docs/api-contract.md` for the initial design and API boundary.

## Current foundation status

The starter UI, API health route, configuration templates, and local PostgreSQL Compose service are in place. Database-backed features and the meeting workflow are subsequent implementation phases.
