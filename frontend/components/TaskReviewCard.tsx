"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api-client";

export type TaskReviewItem = {
  id: string;
  title: string;
  description: string | null;
  assignee_name: string | null;
  due_date: string | null;
  due_date_original: string | null;
  status: string;
  approval_status: string;
  confidence_score: number;
  evidence: Array<{ id: string; quote_text: string; timestamp_seconds: number | null; match_score: number | null }>;
  trust: { evidence_valid: boolean; timestamp_valid: boolean; date_valid: boolean; confidence_valid: boolean; ready_for_approval: boolean; warnings: string[] };
};

function formFromTask(task: TaskReviewItem) {
  return {
    title: task.title,
    description: task.description ?? "",
    assignee_name: task.assignee_name ?? "",
    due_date: task.due_date ?? "",
    due_date_original: task.due_date_original ?? "",
    evidence_quote: task.evidence[0]?.quote_text ?? "",
    timestamp_seconds: task.evidence[0]?.timestamp_seconds?.toString() ?? "",
  };
}

export default function TaskReviewCard({ task, onUpdate, onEvidence }: { task: TaskReviewItem; onUpdate: (task: TaskReviewItem) => void; onEvidence?: (quote: string, confidence: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<Array<{ id: string; action: string; old_value: Record<string, unknown> | null; new_value: Record<string, unknown> | null; created_at: string }> | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [form, setForm] = useState(() => formFromTask(task));
  const finalized = task.approval_status === "approved" || task.approval_status === "rejected";

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const updated = await apiRequest<TaskReviewItem>(`/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          assignee_name: form.assignee_name || null,
          due_date: form.due_date || null,
          due_date_original: form.due_date_original || null,
          evidence_quote: form.evidence_quote,
          timestamp_seconds: form.timestamp_seconds === "" ? null : Number(form.timestamp_seconds),
        }),
      });
      onUpdate(updated);
      setForm(formFromTask(updated));
      setEditing(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save task edits.");
    } finally {
      setSaving(false);
    }
  }

  async function decide(action: "approve" | "reject" | "flag") {
    setError("");
    setBusyAction(action);
    try {
      const updated = await apiRequest<TaskReviewItem>(`/tasks/${task.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ action, note: note || null }),
      });
      onUpdate(updated);
      setNote("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record the review decision.");
    } finally {
      setBusyAction("");
    }
  }

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function toggleHistory() {
    if (!historyOpen && history === null) {
      try {
        const entries = await apiRequest<typeof history>(`/tasks/${task.id}/history`);
        setHistory(entries);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Could not load task history.");
        return;
      }
    }
    setHistoryOpen((open) => !open);
  }

  return <article className="review-card task-review-card">
    <div className="review-card-heading"><h3>{task.title}</h3><span className={`status-badge status-${task.approval_status}`}>{task.approval_status.replaceAll("_", " ")}</span></div>
    {!editing ? <>
      {task.description && <p>{task.description}</p>}
      <dl className="proposal-meta">{task.assignee_name && <div><dt>Suggested owner</dt><dd>{task.assignee_name}</dd></div>}{(task.due_date || task.due_date_original) && <div><dt>Due date</dt><dd>{task.due_date ?? task.due_date_original}</dd></div>}<div><dt>Model confidence</dt><dd>{Math.round(task.confidence_score * 100)}%</dd></div></dl>
      {task.evidence.map((evidence) => <div key={evidence.id}><blockquote className="evidence-quote">“{evidence.quote_text}”</blockquote><button className="evidence-jump" type="button" onClick={() => onEvidence?.(evidence.quote_text, task.confidence_score)}>Show this sentence in transcript · {Math.round(task.confidence_score * 100)}% confidence →</button>{evidence.timestamp_seconds !== null && <p className="source-timestamp">Source timestamp: {formatTimestamp(evidence.timestamp_seconds)}</p>}</div>)}
      <div className="trust-checks" aria-label="Source trust checks">
        <TrustCheck label="Evidence quote" valid={task.trust.evidence_valid} />
        <TrustCheck label="Timestamp" valid={task.trust.timestamp_valid} />
        <TrustCheck label="Due date" valid={task.trust.date_valid} />
        <TrustCheck label="Confidence range" valid={task.trust.confidence_valid} />
      </div>
      {task.trust.warnings.map((warning) => <p className="trust-warning" key={warning}>{warning}</p>)}
      <button className="history-toggle" type="button" onClick={toggleHistory}>{historyOpen ? "Hide change history" : "View change history"}</button>
      {historyOpen && <div className="task-history">{history?.length ? history.map((entry) => <details className="history-entry" key={entry.id}><summary><span>{entry.action.replaceAll(".", " ")}</span><time>{new Date(entry.created_at).toLocaleString()}</time></summary><pre>{JSON.stringify({ before: entry.old_value, after: entry.new_value }, null, 2)}</pre></details>) : <p className="form-note">No organizer changes recorded yet.</p>}</div>}
      {!finalized && <>
        <label className="field review-note-field">Review note <span className="optional">Optional; recorded in history</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={1000} placeholder="Add a reason or note…" /></label>
        <div className="review-actions">
        <button className="button secondary" type="button" onClick={() => { setForm(formFromTask(task)); setEditing(true); }}>Edit proposal</button>
          <button className="button" type="button" disabled={Boolean(busyAction) || !task.trust.ready_for_approval} onClick={() => decide("approve")}>{busyAction === "approve" ? "Approving…" : "Approve"}</button>
          <button className="button danger" type="button" disabled={Boolean(busyAction)} onClick={() => decide("reject")}>{busyAction === "reject" ? "Rejecting…" : "Reject"}</button>
          <button className="button secondary" type="button" disabled={Boolean(busyAction)} onClick={() => decide("flag")}>{busyAction === "flag" ? "Flagging…" : "Flag for review"}</button>
        </div>
      </>}
    </> : <form className="task-edit-form" onSubmit={save}>
      <label className="field">Task title<input required maxLength={250} value={form.title} onChange={(event) => updateField("title", event.target.value)} /></label>
      <label className="field">Description<textarea rows={3} value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
      <label className="field">Suggested owner<input maxLength={120} value={form.assignee_name} onChange={(event) => updateField("assignee_name", event.target.value)} /></label>
      <label className="field">Normalized due date<input type="date" value={form.due_date} onChange={(event) => updateField("due_date", event.target.value)} /></label>
      <label className="field">Original date wording<input maxLength={120} value={form.due_date_original} onChange={(event) => updateField("due_date_original", event.target.value)} placeholder="e.g. by next Friday" /></label>
      <label className="field">Evidence quote<textarea required rows={3} value={form.evidence_quote} onChange={(event) => updateField("evidence_quote", event.target.value)} /></label>
      <label className="field">Timestamp in seconds <span className="optional">Optional; must match a transcript marker beside the quote</span><input type="number" min="0" step="1" value={form.timestamp_seconds} onChange={(event) => updateField("timestamp_seconds", event.target.value)} /></label>
      <div className="review-actions"><button className="button" type="submit" disabled={saving}>{saving ? "Saving…" : "Save edits"}</button><button className="button secondary" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button></div>
    </form>}
    {error && <p className="form-error" role="alert">{error}</p>}
  </article>;
}

function TrustCheck({ label, valid }: { label: string; valid: boolean }) {
  return <span className={valid ? "trust-check valid" : "trust-check invalid"}>{valid ? "✓" : "!"} {label}</span>;
}

function formatTimestamp(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : `${minutes}:${String(seconds).padStart(2, "0")}`;
}
