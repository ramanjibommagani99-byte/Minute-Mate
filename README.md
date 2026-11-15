# MinuteMate

MinuteMate turns meeting discussions into evidence-linked task proposals that an organizer can review and approve before they are tracked.

## MVP boundary

The first release proves one workflow: enter a meeting transcript or notes, extract proposed tasks, decisions, risks, and open questions, review the evidence, approve tasks, then track approved work from the filterable dashboard. Organizers can schedule in-app reminders and demonstrate simulated Slack and Calendar actions for approved tasks. Audio transcription is optional; live third-party connections are deferred.

## Requirements

- Node.js 20.9 or newer and npm
- Python 3.11 or newer
- Docker Desktop with Docker Compose, or a local PostgreSQL 16+ server
- Git

## Run locally on Windows

1. Copy `.env.example` to `backend/.env`. Use a random secret of at least 32 characters for `JWT_SECRET`; set `COOKIE_SECURE=true` when serving over HTTPS. Set `OPENAI_API_KEY` to enable AI extraction and optional audio transcription; transcript and notes entry works without it.
2. Start PostgreSQL with `docker compose up -d db`.
   The Compose database is published on port `5433` so it does not collide with the PostgreSQL service already installed on this computer at port `5432`.
3. In one terminal, start the API:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

4. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

5. Open <http://localhost:3000>. Register at `/register`, then sign in at `/login`. The API health endpoint is <http://localhost:8000/health> and the OpenAPI page is <http://localhost:8000/docs>.

## Project layout

- `frontend/` — Next.js App Router interface
- `backend/` — FastAPI application and service layers
- `database/` — schema and safe demo seed data
- `docs/` — architecture, API, database, testing, and demo notes
- `scripts/` — repeatable local setup helpers

See `docs/architecture.md` and `docs/api-contract.md` for the initial design and API boundary.

## Current foundation status

The starter UI, API health route, account registration and login, protected account endpoint, SQLAlchemy data models, Alembic migration, configuration templates, and local PostgreSQL Compose service are in place. The next implementation phase adds meeting input and transcript/notes storage.
