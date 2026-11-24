# MinuteMate

MinuteMate turns meeting discussions into evidence-linked task proposals that an organizer can review and approve before they are tracked.

## MVP boundary

The first release proves one workflow: enter a meeting transcript or notes, extract proposed tasks, decisions, risks, and open questions, review the evidence, approve tasks, then track approved work from the filterable dashboard. Organizers can schedule in-app reminders, download real `.ics` calendar events for import, and demonstrate a clearly simulated Slack action. Audio transcription is optional.

## Requirements

- Node.js 20.9 or newer and npm
- Python 3.11 or newer
- Docker Desktop with Docker Compose, or a local PostgreSQL 16+ server
- Git

## Run locally on Windows

1. Copy `.env.example` to `backend/.env`. Use a random secret of at least 32 characters for `JWT_SECRET`; set `COOKIE_SECURE=true` when serving over HTTPS. For local semantic extraction, install Ollama, run `ollama pull qwen3:1.7b`, and set `EXTRACTION_PROVIDER=ollama`. Set `EXTRACTION_PROVIDER=local` for the explicit-pattern fallback. **For a hosted deployment set `APP_ENV=production`; production automatically uses the pattern fallback and does not require Ollama.** The pitch can still show Ollama as the local semantic-extraction option. Audio transcription uses AssemblyAI; set `ASSEMBLYAI_API_KEY` to enable it. The AssemblyAI free tier has usage limits; no paid upgrade is needed to use the free allowance.
2. Start PostgreSQL with `docker compose up -d db`.
   The Compose database is published on port `5433` so it does not collide with the PostgreSQL service already installed on this computer at port `5432`.
3. In one terminal, start the API:

   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   alembic upgrade head
   .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001
   ```

4. In another terminal, start the frontend:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   The frontend sends API calls through its own `/api` route so the sign-in cookie stays on the same host. It forwards requests to `http://127.0.0.1:8001` by default. If your API runs elsewhere, put `BACKEND_API_ORIGIN=http://your-api-host:port` in `frontend/.env.local` and restart Next.js.

5. Open <http://localhost:3000>. Register at `/register`, then sign in at `/login`. The API health endpoint is <http://localhost:8001/health> and the OpenAPI page is <http://localhost:8001/docs>.

## Project layout

- `frontend/` — Next.js App Router interface
- `backend/` — FastAPI application and service layers
- `database/` — schema and safe demo seed data
- `docs/` — architecture, API, database, testing, and demo notes
- `scripts/` — repeatable local setup helpers

See `docs/architecture.md` and `docs/api-contract.md` for the initial design and API boundary.

## Current foundation status

Meeting input, extraction and evidence review, approval history, task tracking and filters, reminders, real calendar-file export, and a simulated Slack demo action are implemented. `docs/testing-plan.md` lists the automated checks and local service requirements.
