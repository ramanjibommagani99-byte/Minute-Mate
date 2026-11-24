"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type ApprovedTask = { id: string; title: string; description: string | null; due_date: string | null; meeting_title: string; approval_status: string };
type Reminder = { id: string; task_id: string; task_title: string; remind_at: string; message: string | null; status: string };
type Event = { uid: string; title: string; description: string; start: string; end: string; allDay: boolean };

function escapeIcs(value: string) { return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
function utcStamp(value: Date) { return value.toISOString().replace(/[-:]|\.\d{3}/g, ""); }
function allDayEnd(date: string) { const end = new Date(`${date}T12:00:00Z`); end.setUTCDate(end.getUTCDate() + 1); return end.toISOString().slice(0, 10).replaceAll("-", ""); }

export default function CalendarBundleExport() {
  const [tasks, setTasks] = useState<ApprovedTask[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([apiRequest<ApprovedTask[]>("/tasks?approval_status=approved"), apiRequest<Reminder[]>("/reminders")])
      .then(([taskRows, reminderRows]) => { setTasks(taskRows); setReminders(reminderRows.filter((item) => item.status === "scheduled")); })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load calendar items."))
      .finally(() => setLoading(false));
  }, []);

  function download() {
    const events: Event[] = [
      ...tasks.filter((task) => task.due_date).map((task) => ({ uid: `task-${task.id}@minutemate.local`, title: task.title, description: [task.description, `Meeting: ${task.meeting_title}`, `MinuteMate task ID: ${task.id}`].filter(Boolean).join("\n"), start: task.due_date!.replaceAll("-", ""), end: allDayEnd(task.due_date!), allDay: true })),
      ...reminders.map((reminder) => { const start = new Date(reminder.remind_at); const end = new Date(start.getTime() + 15 * 60_000); return { uid: `reminder-${reminder.id}@minutemate.local`, title: `Reminder: ${reminder.task_title}`, description: reminder.message || `MinuteMate reminder for task ${reminder.task_id}`, start: utcStamp(start), end: utcStamp(end), allDay: false }; }),
    ];
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//MinuteMate//Approved Tasks and Reminders//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH"];
    for (const event of events) lines.push("BEGIN:VEVENT", `UID:${event.uid}`, `DTSTAMP:${utcStamp(new Date())}`, event.allDay ? `DTSTART;VALUE=DATE:${event.start}` : `DTSTART:${event.start}`, event.allDay ? `DTEND;VALUE=DATE:${event.end}` : `DTEND:${event.end}`, `SUMMARY:${escapeIcs(event.title)}`, `DESCRIPTION:${escapeIcs(event.description)}`, "END:VEVENT");
    lines.push("END:VCALENDAR", "");
    const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "minutemate-approved-tasks-and-reminders.ics"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(`${events.length} calendar item${events.length === 1 ? "" : "s"} downloaded. Import the file into your calendar.`);
  }

  return <section className="calendar-export calendar-bundle-export"><div><h2>Calendar export</h2><p className="form-note">Download approved task deadlines and scheduled reminders as a standard .ics file. Import it into Google Calendar, Outlook, or Apple Calendar when ready.</p></div>{loading ? <p className="form-note">Loading approved calendar items…</p> : error ? <p className="form-error" role="alert">{error}</p> : <><p className="calendar-count">{tasks.filter((task) => task.due_date).length} task deadlines · {reminders.length} reminders</p><button className="button secondary" type="button" onClick={download} disabled={!tasks.some((task) => task.due_date) && !reminders.length}>Download calendar file (.ics)</button>{message && <p className="form-success" role="status">{message}</p>}</>}</section>;
}
