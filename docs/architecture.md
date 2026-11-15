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
- Check evidence quotes against the source and only accept timestamps that match transcript markers.
- Keep low-confidence or date-uncertain proposals in the organizer review queue.
- Audit edits, approvals, rejections, and flags with before/after values.
- Do not create an external action for an unapproved proposal.
- Keep Slack and Calendar actions in the demo simulated; store each attempted demo action as a sync event.
- Surface scheduled reminders in the app while the organizer has MinuteMate open.
- Record material edits and approval state changes in an audit history.
