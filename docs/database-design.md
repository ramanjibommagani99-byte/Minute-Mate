# Database design

The MVP will use PostgreSQL. The planned core tables are users, meetings, participants, tasks, task_evidence, decisions, integrations, task_sync_events, and audit_logs. SQLAlchemy models and Alembic migrations will be introduced with the database and workflow phases.

The local Compose service currently creates an empty `minutemate` database. Do not store real personal meeting data in demo fixtures.
