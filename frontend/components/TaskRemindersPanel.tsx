"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type Reminder = { id: string; task_id: string; task_title: string; remind_at: string; message: string | null; status: "scheduled" | "dismissed"; is_due: boolean };

export default function TaskRemindersPanel() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [error, setError] = useState("");

  const refresh = useCallback(() => {
    apiRequest<Reminder[]>("/reminders")
      .then(setReminders)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load reminders."));
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function dismiss(id: string) {
    try {
      await apiRequest(`/reminders/${id}/dismiss`, { method: "PATCH" });
      setReminders((current) => current.filter((reminder) => reminder.id !== id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not dismiss this reminder.");
    }
  }

  if (error) return <section className="reminders-panel"><p className="form-error" role="alert">{error}</p></section>;
  if (!reminders.length) return null;

  return <section className="reminders-panel" aria-label="Task reminders">
    <div className="reminders-heading"><div><p className="eyebrow">In-app reminders</p><h2>Follow-ups</h2></div><span className="count-badge">{reminders.filter((item) => item.is_due).length} due</span></div>
    <div className="reminder-list">{reminders.map((reminder) => <article className={reminder.is_due ? "reminder-item is-due" : "reminder-item"} key={reminder.id}>
      <div><strong><Link href={`/tasks/${reminder.task_id}`}>{reminder.task_title}</Link></strong><p>{reminder.message || (reminder.is_due ? "Reminder due now" : "Upcoming reminder")}</p><time>{new Date(reminder.remind_at).toLocaleString()}</time></div>
      <button className="button secondary reminder-dismiss" type="button" onClick={() => dismiss(reminder.id)}>Dismiss</button>
    </article>)}</div>
    <p className="form-note">Reminders appear here while MinuteMate is open and refresh every minute.</p>
  </section>;
}
