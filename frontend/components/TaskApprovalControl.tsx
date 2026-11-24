"use client";

import { useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api-client";
import type { TaskTracking } from "@/components/TaskStatusControl";

type Action = "approve" | "reject" | "flag";

export default function TaskApprovalControl({ task, onUpdate }: { task: TaskTracking; onUpdate: (task: TaskTracking) => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<Action | "">("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const reviewable = task.approval_status === "pending" || task.approval_status === "needs_review";

  if (!reviewable) return null;

  async function decide(action: Action) {
    setBusy(action);
    setError("");
    setMessage("");
    try {
      const result = await apiRequest<Pick<TaskTracking, "id" | "status" | "approval_status" | "title" | "description" | "assignee_name" | "due_date" | "due_date_original" | "confidence_score" | "evidence" | "trust">>(`/tasks/${task.id}/decision`, {
        method: "POST",
        body: JSON.stringify({ action, note: note.trim() || null }),
      });
      onUpdate({ ...task, ...result });
      setNote("");
      setMessage(action === "approve" ? "Approved. Progress tracking is now available." : action === "reject" ? "Proposal rejected." : "Sent back for review.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this review decision.");
    } finally {
      setBusy("");
    }
  }

  return <section className="task-approval-panel" aria-label="Review task approval">
    <div><p className="eyebrow">Organizer review</p><h2>Approve this task to track progress</h2><p className="form-note">Verify its evidence, owner, and due date before approval.</p></div>
    {task.trust.warnings.length > 0 && <ul className="approval-warnings">{task.trust.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
    <form onSubmit={(event) => { event.preventDefault(); void decide("approve"); }}>
      <label className="field">Review note <span className="optional">Optional</span><input maxLength={1000} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note to the audit history" /></label>
      <div className="approval-actions">
        <button className="button" type="submit" disabled={Boolean(busy) || !task.trust.ready_for_approval}>{busy === "approve" ? "Approving…" : "Approve task"}</button>
        <button className="button danger" type="button" disabled={Boolean(busy)} onClick={() => void decide("reject")}>{busy === "reject" ? "Rejecting…" : "Reject"}</button>
        <button className="button secondary" type="button" disabled={Boolean(busy)} onClick={() => void decide("flag")}>{busy === "flag" ? "Flagging…" : "Flag for review"}</button>
      </div>
    </form>
    {!task.trust.ready_for_approval && <p className="form-note">Resolve the source trust issues before this task can be approved.</p>}
    {error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}
  </section>;
}
