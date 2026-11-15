"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";

export type TaskStatusValue = "not_started" | "in_progress" | "completed" | "overdue";
export type TaskApprovalValue = "pending" | "approved" | "rejected" | "needs_review";

export type TaskTracking = {
  id: string;
  meeting_id: string;
  meeting_title: string;
  meeting_date: string | null;
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
  const canTrack = task.approval_status === "approved";

  async function changeStatus(status: TaskStatusValue) {
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<TaskTracking>(`/tasks/${task.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      onUpdate(updated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update task status.");
    } finally {
      setSaving(false);
    }
  }

  return <div className="status-control">
    <label className="status-select-label">Progress status
      <select aria-label="Progress status" value={task.status} disabled={!canTrack || saving} onChange={(event) => changeStatus(event.target.value as TaskStatusValue)}>
        {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
    {!canTrack && <small>Progress tracking starts after approval.</small>}
    {error && <small className="form-error" role="alert">{error}</small>}
  </div>;
}
