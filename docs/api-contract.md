# Initial API contract

The API is served at `http://localhost:8000`. Interactive documentation is available at `/docs`.

| Method | Path | Foundation behavior |
|---|---|---|
| GET | `/health` | Returns service status and application name |
| POST | `/auth/register` | Creates an organizer account |
| POST | `/auth/login` | Checks credentials and sets an HttpOnly session cookie |
| POST | `/auth/logout` | Clears the session cookie |
| GET | `/auth/me` | Returns the authenticated account; requires a valid cookie or bearer token |

Planned routes, added in later phases: meeting input and retrieval, transcription, extraction, task review and approval, dashboard queries, reminders, and simulated Slack/Calendar actions.
