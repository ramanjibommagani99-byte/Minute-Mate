# Database design

The MVP uses PostgreSQL with SQLAlchemy models and Alembic migrations. The core schema contains users, meetings, participants, tasks, task_evidence, decisions, meeting_risks, open_questions, integrations, task_sync_events, and audit_logs. Relationships and delete behavior are enforced with foreign keys; task states, confidence ranges, and provider values are constrained in the database. Each extracted task, decision, risk, and open question retains an evidence quote linked to its source meeting.

The local Compose service creates the `minutemate` database. Apply the schema from the backend folder with `alembic upgrade head`. Do not store real personal meeting data in demo fixtures.
