# Initial API contract

The API is served at `http://localhost:8000`. Interactive documentation is available at `/docs`.

| Method | Path | Foundation behavior |
|---|---|---|
| GET | `/health` | Returns service status and application name |
| POST | `/auth/register` | Creates an organizer account |
| POST | `/auth/login` | Checks credentials and sets an HttpOnly session cookie |
| POST | `/auth/logout` | Clears the session cookie |
| GET | `/auth/me` | Returns the authenticated account; requires a valid cookie or bearer token |
| POST | `/meetings` | Saves a transcript or notes source for the signed-in organizer |
| GET | `/meetings` | Lists only the signed-in organizer's meetings |
| GET | `/meetings/{meeting_id}` | Returns a saved meeting and its source, only for its owner |

The basic input path accepts `title`, optional ISO `meeting_date`, `source_type` (`transcript` or `notes`), and `source_text`. Audio transcription, extraction, task review and approval, dashboard queries, reminders, and simulated Slack/Calendar actions remain future phases.
