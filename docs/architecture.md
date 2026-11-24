# MinuteMate architecture

## MVP workflow

Meeting transcript or notes → local Ollama semantic extraction (or the explicit-pattern fallback; production forces the fallback) → evidence, timestamp, and date grounding → organizer review → approved task storage → filterable dashboard, in-app reminders, and calendar-file export. Optional audio upload → AssemblyAI transcription with sentence timestamp markers → the same review workflow.

The user interface is a Next.js App Router application. It calls a FastAPI backend, which owns extraction, validation, persistence, approval rules, and reminders. In local development, Ollama can run the Qwen model and return schema-constrained JSON; production uses the rule-based fallback so hosting does not depend on an Ollama daemon. PostgreSQL is the system of record. Extracted output remains a proposal until a meeting organizer approves it. Calendar events are exported as `.ics` files for organizer-controlled import; Slack remains simulated.

## Initial boundaries

- Frontend: `frontend/`
- Backend API and services: `backend/app/`
- Database assets: `database/`
- Local PostgreSQL: Docker Compose service `db`
- Slack integration: simulated and labeled as such
- Calendar integration: standard `.ics` event export; organizers choose whether to import it
- Local semantic extraction: Ollama at `OLLAMA_BASE_URL`, model selected by `OLLAMA_MODEL`

## Trust rules

- Keep the original transcript available for review.
- Store evidence and original date wording with each proposal.
- Check evidence quotes against the source and only accept timestamps that match transcript markers.
- Keep low-confidence or date-uncertain proposals in the organizer review queue.
- Audit edits, approvals, rejections, and flags with before/after values.
- Do not create an external action for an unapproved proposal.
- Keep the guided sample local-only; label the real workspace's Slack action as simulated.
- Generate calendar files locally; never claim the event was added until the organizer imports it.
- Surface scheduled reminders in the app while the organizer has MinuteMate open.
- Record material edits and approval state changes in an audit history.
