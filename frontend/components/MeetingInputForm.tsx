"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_URL, apiRequest } from "@/lib/api-client";

type Meeting = { id: string };

export default function MeetingInputForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [sourceText, setSourceText] = useState("");
  const [sourceType, setSourceType] = useState<"transcript" | "notes" | "audio">("transcript");

  async function transcribeAudio(formElement: HTMLFormElement | null) {
    const input = formElement?.elements.namedItem("audio_file");
    if (!(input instanceof HTMLInputElement) || !input.files?.[0]) {
      setError("Choose an audio file to transcribe.");
      return;
    }
    setError("");
    setTranscribing(true);
    const form = new FormData();
    form.append("file", input.files[0]);
    try {
      const response = await fetch(`${API_URL}/meetings/transcribe`, {
        method: "POST",
        credentials: "include",
        body: form,
      });
      const result = await response.json() as { text?: string; detail?: string };
      if (!response.ok) throw new Error(result.detail ?? `Transcription failed (${response.status})`);
      setSourceText(result.text ?? "");
      setSourceType("audio");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not transcribe this audio.");
    } finally {
      setTranscribing(false);
    }
  }

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
          project_name: form.get("project_name"),
          meeting_date: localDate ? new Date(localDate).toISOString() : null,
          source_type: sourceType === "audio" ? "audio" : (form.get("source_type") ?? sourceType),
          source_text: sourceText || form.get("source_text"),
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
      <label className="field">Project <span className="optional">Optional</span><input name="project_name" maxLength={120} placeholder="Website launch" /></label>
      <label className="field">Meeting date and time <span className="optional">Optional</span><input name="meeting_date" type="datetime-local" /></label>
      <label className="field">Source type<select name="source_type" value={sourceType === "audio" ? "transcript" : sourceType} onChange={(event) => setSourceType(event.target.value as "transcript" | "notes")}><option value="transcript">Transcript</option><option value="notes">Notes</option></select></label>
      <div className="audio-panel"><label className="field">Or transcribe an audio file <span className="optional">Optional · MP3, WAV, M4A, MP4, OGG, FLAC, WEBM · up to 25 MB</span><input name="audio_file" type="file" accept=".flac,.mp3,.mp4,.mpeg,.mpga,.m4a,.ogg,.wav,.webm,audio/*" /></label><button className="button secondary" type="button" disabled={transcribing} onClick={(event) => transcribeAudio(event.currentTarget.form)}>{transcribing ? "Transcribing…" : "Transcribe audio"}</button><p className="form-note">Audio transcription uses AssemblyAI. Add ASSEMBLYAI_API_KEY to backend/.env; free-tier limits apply. You can also paste a transcript or notes below.</p></div>
      <label className="field">Transcript or notes<textarea name="source_text" value={sourceText} onChange={(event) => { setSourceText(event.target.value); if (sourceType === "audio") setSourceType("transcript"); }} required minLength={1} maxLength={500000} rows={14} placeholder="Paste a transcript, enter notes, or transcribe an audio file above…" /></label>
      <p className="form-note">Your source is saved to your account. Extracted proposals stay unapproved until you review them.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save meeting source"}</button>
    </form>
  );
}
