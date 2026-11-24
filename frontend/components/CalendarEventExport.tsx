"use client";

import { useState } from "react";
import type { TaskTracking } from "@/components/TaskStatusControl";

function escapeIcs(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function nextDate(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

export default function CalendarEventExport({ task }: { task: TaskTracking }) {
  const [calendarDate, setCalendarDate] = useState(task.due_date ?? "");
  const [message, setMessage] = useState("");

  function downloadEvent() {
    if (!calendarDate) return;
    const dtstamp = new Date().toISOString().replace(/[-:]|\.\d{3}/g, "");
    const details = [
      task.description,
      task.assignee_name ? `Owner: ${task.assignee_name}` : null,
      `Meeting: ${task.meeting_title}`,
      `MinuteMate task ID: ${task.id}`,
    ].filter(Boolean).join("\n");
    const contents = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//MinuteMate//Task Calendar Export//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${task.id}@minutemate.local`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${calendarDate.replaceAll("-", "")}`,
      `DTEND;VALUE=DATE:${nextDate(calendarDate)}`,
      `SUMMARY:${escapeIcs(task.title)}`,
      `DESCRIPTION:${escapeIcs(details)}`,
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");
    const file = new Blob([contents], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${task.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "minutemate-task"}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Calendar file downloaded. Import it into your calendar to add the event.");
  }

  return <div className="calendar-export">
    <h3>Export a calendar event</h3>
    <p className="form-note">Download a standard .ics event for Google Calendar, Outlook, or Apple Calendar. You choose whether to import it; MinuteMate does not send it automatically.</p>
    <label className="field">Calendar date<input aria-label="Calendar event date" type="date" required value={calendarDate} onChange={(event) => { setCalendarDate(event.target.value); setMessage(""); }} /></label>
    <button className="button secondary" type="button" disabled={!calendarDate} onClick={downloadEvent}>Download .ics event</button>
    {message && <p className="form-success" role="status">{message}</p>}
  </div>;
}
