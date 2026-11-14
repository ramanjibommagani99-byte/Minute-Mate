"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type Meeting = { id: string; title: string; meeting_date: string | null; source_type: "transcript" | "notes"; source_text: string; created_at: string };

export default function MeetingSource({ id }: { id: string }) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Meeting>(`/meetings/${id}`).then(setMeeting)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load this meeting."));
  }, [id]);

  if (error) return <main className="main"><p className="form-error" role="alert">{error}</p><Link className="auth-link" href="/dashboard">Back to meetings</Link></main>;
  if (!meeting) return <main className="main"><p className="form-note">Loading meeting source…</p></main>;

  return <main className="main">
    <Link className="auth-link" href="/dashboard">← All meetings</Link>
    <p className="eyebrow">Saved {meeting.source_type}</p>
    <h1>{meeting.title}</h1>
    <p className="form-note">{meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleString() : `Added ${new Date(meeting.created_at).toLocaleDateString()}`}</p>
    <article className="source-card"><h2>Original source</h2><pre className="source-text">{meeting.source_text}</pre></article>
  </main>;
}
