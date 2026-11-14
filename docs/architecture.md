# MinuteMate architecture

## MVP workflow

Meeting transcript or notes → structured extraction → evidence and date validation → organizer review → approved task storage → dashboard and simulated follow-up actions.

The user interface is a Next.js App Router application. It calls a FastAPI backend, which owns validation, persistence, approval rules, reminders, and integration adapters. PostgreSQL is the system of record. AI output remains a proposal until a meeting organizer approves it.

## Initial boundaries

- Frontend: `frontend/`
- Backend API and services: `backend/app/`
- Database assets: `database/`
- Local PostgreSQL: Docker Compose service `db`
- Live provider integrations: deferred; MVP actions are simulated

## Trust rules

- Keep the original transcript available for review.
- Store evidence and original date wording with each proposal.
- Do not create an external action for an unapproved proposal.
- Record material edits and approval state changes in an audit history.
