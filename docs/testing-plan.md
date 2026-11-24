# Testing plan

Verification includes unit checks for date normalization, quote matching, and confidence; schema checks for extraction responses; API checks for authentication, dashboard filters, and task transitions; frontend unit tests; and a Playwright browser workflow. A labelled edge-case dataset covers missing owners, relative and ambiguous dates, timestamps, questions, and non-action statements.

The acceptance workflow must prove that an unapproved task never triggers an external action. Tests will be added alongside the features they cover.

## Current acceptance verification

Run the isolated backend checks from `backend` with `\.venv\Scripts\python.exe -m unittest discover -s tests -v`. Run frontend unit tests with `npm test`; type checking remains `npm run typecheck`; browser tests use `npm run test:e2e`.

`tests/test_acceptance_workflow.py` uses an in-memory SQLite database and a mocked extraction result. It verifies source submission through proposal persistence, approval gating for reminders/status changes/demo integrations, appearance in the approved dashboard query, and local-only simulated Slack and Calendar records. It also checks missing authentication, unsupported evidence quotes, unresolved owner/date fields, and invalid confidence/timestamp values. No AI provider or real Slack/Calendar service is contacted by these checks.

`tests/test_extraction_edges.py` evaluates the labeled fixture dataset and relative dates. Frontend unit coverage checks dashboard filter serialization. Three Playwright workflows cover meeting capture through approval and dashboard filtering, the separate review/follow-through views, and the guided sample demo without API calls. The API is mocked in the browser suite, so these checks do not need a database, account, paid AI provider, or external integration. Live Ollama extraction and AssemblyAI audio transcription require their local service/API key respectively and are not invoked by automated tests.

Latest verification: 12 backend tests, 2 frontend unit tests, 3 Playwright tests, TypeScript type checking, and a production build pass. The production build used a temporary isolated output directory because Windows would not remove a stale directory in the active `.next` cache. The local Ollama model `qwen3:1.7b` is installed, and PostgreSQL is at Alembic head `d71c4a9f2b30`.
