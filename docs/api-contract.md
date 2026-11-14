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
| POST | `/meetings/transcribe` | Optionally transcribes an audio upload for the signed-in user; requires `OPENAI_API_KEY` |
| POST | `/meetings/{meeting_id}/extract` | Extracts and saves schema-validated tasks, decisions, risks, and open questions for the owner |
| GET | `/meetings/{meeting_id}/extraction` | Returns the saved extraction and evidence quotes for review |

The basic input path accepts `title`, optional ISO `meeting_date`, `source_type` (`transcript`, `notes`, or `audio`), and `source_text`. The optional transcription route accepts supported audio files up to 25 MB and sends them to OpenAI for transcription; MinuteMate does not retain the uploaded audio, and the returned transcript can be saved as the meeting source. Extraction uses strict structured output and persists only evidence quotes that match the source. All extracted tasks remain unapproved proposals. Dashboard queries, task approval actions, reminders, and simulated Slack/Calendar actions remain future phases.
