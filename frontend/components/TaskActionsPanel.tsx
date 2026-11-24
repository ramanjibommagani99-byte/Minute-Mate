"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api-client";
import type { TaskTracking } from "@/components/TaskStatusControl";
import CalendarEventExport from "@/components/CalendarEventExport";

type Reminder = { id: string; remind_at: string; message: string | null; is_due: boolean };
type SyncEvent = { id: string; provider: "slack" | "google_calendar"; external_task_id: string | null; sync_status: string; created_at: string; demo_only: boolean };

export default function TaskActionsPanel({ task }: { task: TaskTracking }) {
  const [remindAt, setRemindAt] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const approved = task.approval_status === "approved";

  useEffect(() => {
    if (!approved) return;
    apiRequest<Reminder[]>(`/reminders?task_id=${task.id}`).then(setReminders).catch(() => setReminders([]));
    apiRequest<SyncEvent[]>(`/tasks/${task.id}/demo-sync-events`).then(setEvents).catch(() => setEvents([]));
  }, [approved, task.id]);

  async function schedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!remindAt) return;
    setBusy("reminder");
    setError("");
    try {
      const reminder = await apiRequest<Reminder>(`/tasks/${task.id}/reminders`, {
        method: "POST",
        body: JSON.stringify({ remind_at: new Date(remindAt).toISOString(), message: reminderMessage || null }),
      });
      setReminders((current) => [...current, reminder].sort((a, b) => a.remind_at.localeCompare(b.remind_at)));
      setRemindAt("");
      setReminderMessage("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not schedule reminder.");
    } finally {
      setBusy("");
    }
  }

  async function demoAction(provider: "slack") {
    setBusy(provider);
    setError("");
    try {
      const event = await apiRequest<SyncEvent>(`/tasks/${task.id}/demo-sync`, {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      setEvents((current) => [event, ...current]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record demo action.");
    } finally {
      setBusy("");
    }
  }

  return <section className="task-actions-panel">
    <h2>Reminders and integrations</h2>
    {!approved ? <p className="form-note">Reminders and integration actions are available after organizer approval.</p> : <>
      <form className="reminder-form" onSubmit={schedule}>
        <h3>Set an in-app reminder</h3>
        <label className="field">Remind me at<input type="datetime-local" required value={remindAt} onChange={(event) => setRemindAt(event.target.value)} /></label>
        <label className="field">Note <span className="optional">Optional</span><input maxLength={500} value={reminderMessage} onChange={(event) => setReminderMessage(event.target.value)} placeholder="Check progress with the owner" /></label>
        <button className="button" type="submit" disabled={busy !== ""}>{busy === "reminder" ? "Scheduling…" : "Schedule reminder"}</button>
      </form>
      {reminders.length > 0 && <div className="task-reminder-list"><h3>Scheduled for this task</h3>{reminders.map((reminder) => <p key={reminder.id}>{new Date(reminder.remind_at).toLocaleString()}{reminder.message ? ` · ${reminder.message}` : ""}</p>)}</div>}
      <CalendarEventExport task={task} />
      <div className="demo-integration-block"><h3>Slack demo simulation</h3><p className="form-note">Slack is not connected. This action only records a simulated event in MinuteMate and does not send a Slack message.</p><button className="button secondary" type="button" disabled={busy !== ""} onClick={() => demoAction("slack")}>{busy === "slack" ? "Recording…" : "Simulate Slack action"}</button></div>
      {events.length > 0 && <div className="task-demo-history"><h3>Previous simulated action history</h3>{events.map((item) => <p key={item.id}><strong>{item.provider === "slack" ? "Slack" : "Legacy Calendar action"}</strong> · simulated · {new Date(item.created_at).toLocaleString()}</p>)}</div>}
    </>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}
