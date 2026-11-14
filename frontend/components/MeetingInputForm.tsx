"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

type Meeting = { id: string };

export default function MeetingInputForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const form = new FormData(event.currentTarget);
    const localDate = String(form.get("meeting_date") ?? "");
    try {
      const meeting = await apiRequest<Meeting>("/meetings", {
        method: "POST",
        body: JSON.stringify({
          title: form.get("title"),
          meeting_date: localDate ? new Date(localDate).toISOString() : null,
          source_type: form.get("source_type"),
          source_text: form.get("source_text"),
        }),
      });
      router.push(`/meetings/${meeting.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this meeting.");
      setSaving(false);
    }
  }

  return (
    <form className="meeting-form" onSubmit={submit}>
      <label className="field">Meeting title<input name="title" required maxLength={200} placeholder="Weekly product sync" /></label>
      <label className="field">Meeting date and time <span className="optional">Optional</span><input name="meeting_date" type="datetime-local" /></label>
      <label className="field">Source type<select name="source_type" defaultValue="transcript"><option value="transcript">Transcript</option><option value="notes">Notes</option></select></label>
      <label className="field">Transcript or notes<textarea name="source_text" required minLength={1} maxLength={500000} rows={14} placeholder="Paste the meeting transcript or notes here…" /></label>
      <p className="form-note">Your source is saved to your account and visible only to you. MinuteMate will not create tasks until the review workflow is added.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save meeting source"}</button>
    </form>
  );
}
