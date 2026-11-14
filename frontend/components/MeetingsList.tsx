"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type Meeting = { id: string; title: string; meeting_date: string | null; source_type: "transcript" | "notes"; created_at: string };

export default function MeetingsList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<Meeting[]>("/meetings")
      .then(setMeetings)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load meetings."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="form-note">Loading your meetings…</p>;
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (meetings.length === 0) return <div className="placeholder">No saved meetings yet. Start by adding a transcript or notes.</div>;

  return <div className="meeting-list">{meetings.map((meeting) => (
    <Link className="meeting-row" href={`/meetings/${meeting.id}`} key={meeting.id}>
      <span><strong>{meeting.title}</strong><small>{meeting.meeting_date ? new Date(meeting.meeting_date).toLocaleString() : `Saved ${new Date(meeting.created_at).toLocaleDateString()}`}</small></span>
      <span className="source-badge">{meeting.source_type}</span>
    </Link>
  ))}</div>;
}
