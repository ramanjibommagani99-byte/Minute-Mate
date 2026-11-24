# Initial API contract

The API is served at `http://localhost:8001`. Interactive documentation is available at `/docs`.

| Method | Path | Foundation behavior |
|---|---|---|
| GET | `/health` | Returns service status and application name |
| POST | `/auth/register` | Creates an organizer account |
| POST | `/auth/login` | Checks credentials and sets an HttpOnly session cookie |
| POST | `/auth/logout` | Clears the session cookie |
| GET | `/auth/me` | Returns the authenticated account; requires a valid cookie or bearer token |
| POST | `/meetings` | Saves a transcript or notes source and optional project name for the signed-in organizer |
| GET | `/meetings` | Lists only the signed-in organizer's meetings |
| GET | `/meetings/carry-over` | Returns the latest meeting's open questions and the organizer's overdue, unfinished approved tasks |
| GET | `/meetings/{meeting_id}` | Returns a saved meeting and its source, only for its owner |
| POST | `/meetings/transcribe` | Transcribes supported audio with AssemblyAI when `ASSEMBLYAI_API_KEY` is set; free-tier limits apply |
| POST | `/meetings/{meeting_id}/extract` | Extracts and saves schema-validated outcomes; production uses the rule-based fallback |
| GET | `/meetings/{meeting_id}/extraction` | Returns the saved extraction and evidence quotes for review |
| PATCH | `/tasks/{task_id}` | Organizer edits proposal fields and source evidence; edits return it to review |
| POST | `/tasks/{task_id}/decision` | Organizer approves, rejects, or flags a task; trust checks gate approval |
| GET | `/tasks/{task_id}/history` | Returns the task audit history with before/after values and review notes |
| GET | `/tasks` | Lists the signed-in organizer's approved and pending tasks; supports `approval_status` (including `review` for pending and needs-review proposals), `task_status`, `assignee_name`, `project_name`, `due_date_from`, and `due_date_to` filters |
| GET | `/tasks/{task_id}` | Returns owner-scoped task details and evidence |
| PATCH | `/tasks/{task_id}/status` | Updates progress for an approved task and records the status change |
| POST | `/tasks/{task_id}/reminders` | Schedules an in-app reminder for an approved task |
| GET | `/reminders` | Lists scheduled reminders for the signed-in organizer, including due state |
| PATCH | `/reminders/{reminder_id}/dismiss` | Dismisses a reminder and records the change |
| POST | `/tasks/{task_id}/demo-sync` | Records a simulated Slack or legacy Google Calendar action for an approved task |
| GET | `/tasks/{task_id}/demo-sync-events` | Lists recorded demo-action history; the current UI only offers simulated Slack |

The basic input path accepts `title`, optional `project_name`, optional ISO `meeting_date`, `source_type` (`transcript`, `notes`, or `audio`), and `source_text`. Local development can use the Ollama API with `OLLAMA_MODEL` and a strict JSON schema; `EXTRACTION_PROVIDER=local` selects the bounded rule-based fallback. When `APP_ENV=production`, MinuteMate enforces the rule-based fallback so hosted deployments do not require Ollama. Relative deadlines are interpreted against the meeting date and ambiguous dates stay unresolved. Evidence quotes must match the source, and recognizable source timestamp markers are retained. Audio transcription sends supported uploads up to 25 MB to AssemblyAI when `ASSEMBLYAI_API_KEY` is configured. Its default word timestamps are grouped into timestamped sentence lines; no speaker diarization or additional paid transcription feature is requested. Its free tier has usage limits; paid upgrade is optional. Organizer edits, decisions, and review notes are stored in `audit_logs`. Approval requires valid source evidence, timestamps, dates, and confidence range; low confidence is shown as a warning for organizer consideration. All extracted tasks start unapproved. Reminders appear in the in-app dashboard while the app is open. The task page generates a real all-day calendar `.ics` event for organizer-controlled import; Slack remains simulated and only creates a local sync event.
