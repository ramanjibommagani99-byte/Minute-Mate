"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiRequest } from "@/lib/api-client";

export type TaskStatusValue = "not_started" | "in_progress" | "completed" | "overdue";
export type TaskApprovalValue = "pending" | "approved" | "rejected" | "needs_review";

export type TaskTracking = {
  id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string | null;
  project_name: string | null;
  title: string;
  description: string | null;
  assignee_name: string | null;
  due_date: string | null;
  due_date_original: string | null;
  status: TaskStatusValue;
  approval_status: TaskApprovalValue;
  confidence_score: number;
  evidence: Array<{ id: string; quote_text: string; timestamp_seconds: number | null; match_score: number | null }>;
  trust: { evidence_valid: boolean; timestamp_valid: boolean; date_valid: boolean; confidence_valid: boolean; ready_for_approval: boolean; warnings: string[] };
};

const statusLabels: Record<TaskStatusValue, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
  overdue: "Overdue",
};

export default function TaskStatusControl({ task, onUpdate }: { task: TaskTracking; onUpdate: (task: TaskTracking) => void }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusValue>(task.status);
  const canTrack = task.approval_status === "approved";
  const hasChanges = selectedStatus !== task.status;

  useEffect(() => setSelectedStatus(task.status), [task.id, task.status]);

  async function changeStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canTrack || !hasChanges) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await apiRequest<TaskTracking>(`/tasks/${task.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: selectedStatus }),
      });
      onUpdate(updated);
      setSelectedStatus(updated.status);
      setMessage("Progress updated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update task status.");
    } finally {
      setSaving(false);
    }
  }

  return <form className="status-control" onSubmit={changeStatus}>
    <label className="status-select-label">Progress status
      <select aria-label="Progress status" value={selectedStatus} disabled={!canTrack || saving} onChange={(event) => { setSelectedStatus(event.target.value as TaskStatusValue); setError(""); setMessage(""); }}>
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    {!canTrack && <small>Approve this task first to enable progress updates.</small>}
    {canTrack && <button className="button secondary progress-update-button" type="submit" disabled={!hasChanges || saving}>{saving ? "Updating…" : "Update progress"}</button>}
    {error && <small className="form-error" role="alert">{error}</small>}
    {message && <small className="form-success" role="status">{message}</small>}
  </form>;
}
