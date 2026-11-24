"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type CarryOver = {
  meeting_id: string | null;
  meeting_title: string | null;
  open_questions: Array<{ id: string; question_text: string; evidence_quote: string }>;
  overdue_tasks: Array<{ id: string; title: string; due_date: string; meeting_title: string }>;
};

export default function MeetingCarryOverPanel() {
  const [data, setData] = useState<CarryOver | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<CarryOver>("/meetings/carry-over").then(setData)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load previous meeting follow-ups."));
  }, []);

  if (error) return <section className="carry-over-panel"><p className="form-note">Previous follow-ups are unavailable right now.</p></section>;
  if (!data || (!data.open_questions.length && !data.overdue_tasks.length)) return null;

  return <section className="carry-over-panel" aria-label="Previous meeting carry-over">
    <div className="carry-over-heading"><div><p className="eyebrow">Previously on…</p><h2>{data.meeting_title ?? "Your recent meetings"}</h2></div>{data.meeting_id && <Link className="text-link" href={`/meetings/${data.meeting_id}`}>Open previous meeting →</Link>}</div>
    <div className="carry-over-columns">
      <div><h3>Open questions <span className="count-badge">{data.open_questions.length}</span></h3>{data.open_questions.length ? <ul>{data.open_questions.map((item) => <li key={item.id}>{item.question_text}<small>“{item.evidence_quote}”</small></li>)}</ul> : <p className="empty-line">No open questions carried forward.</p>}</div>
      <div><h3>Overdue approved tasks <span className="count-badge">{data.overdue_tasks.length}</span></h3>{data.overdue_tasks.length ? <ul>{data.overdue_tasks.map((item) => <li key={item.id}><Link href={`/tasks/${item.id}`}>{item.title}</Link><small>Due {item.due_date} · {item.meeting_title}</small></li>)}</ul> : <p className="empty-line">No overdue tasks.</p>}</div>
    </div>
  </section>;
}
