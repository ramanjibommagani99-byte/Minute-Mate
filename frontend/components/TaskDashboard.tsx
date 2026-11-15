"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import TaskStatusControl, { type TaskTracking } from "@/components/TaskStatusControl";

type ApprovalFilter = "active" | "all" | "pending" | "approved" | "needs_review" | "rejected";
type StatusFilter = "all" | TaskTracking["status"];

const approvalLabels: Record<ApprovalFilter, string> = {
  active: "Active proposals and approved tasks",
  all: "All tasks",
  pending: "Pending approval",
  approved: "Approved",
  needs_review: "Needs review",
  rejected: "Rejected",
};

export default function TaskDashboard() {
  const [tasks, setTasks] = useState<TaskTracking[]>([]);
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>("active");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (approvalFilter !== "active") params.set("approval_status", approvalFilter);
    if (statusFilter !== "all") params.set("task_status", statusFilter);
    const query = params.size ? `?${params.toString()}` : "";
    apiRequest<TaskTracking[]>(`/tasks${query}`)
      .then(setTasks)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load tasks."))
      .finally(() => setLoading(false));
  }, [approvalFilter, statusFilter]);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  function updateTask(updated: TaskTracking) {
    const approvalMatches = approvalFilter === "active" || approvalFilter === "all" || updated.approval_status === approvalFilter;
    const statusMatches = statusFilter === "all" || updated.status === statusFilter;
    setTasks((current) => approvalMatches && statusMatches
      ? current.map((task) => task.id === updated.id ? updated : task)
      : current.filter((task) => task.id !== updated.id));
  }

  return <main className="main">
    <p className="eyebrow">Task tracking</p>
    <h1>Team follow-through</h1>
    <p className="lead">See what is awaiting review and track approved commitments.</p>
    <section className="task-filters" aria-label="Filter tasks">
      <label className="field">Approval state<select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value as ApprovalFilter)}>{Object.entries(approvalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="field">Progress status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}><option value="all">All progress states</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="overdue">Overdue</option></select></label>
    </section>
    {loading ? <p className="form-note">Loading tasks…</p> : error ? <p className="form-error" role="alert">{error}</p> : tasks.length === 0 ? <div className="placeholder">No tasks match these filters yet. Extract a meeting and review its proposals to get started.</div> : <section className="tracked-task-list" aria-label="Tasks">
      {tasks.map((task) => <article className="tracked-task-card" key={task.id}>
        <div className="tracked-task-heading"><div><p className="eyebrow">{task.approval_status.replaceAll("_", " ")}</p><h2><Link href={`/tasks/${task.id}`}>{task.title}</Link></h2></div><span className={`status-badge status-${task.approval_status}`}>{task.approval_status.replaceAll("_", " ")}</span></div>
        <p className="task-meeting-link">From <Link href={`/meetings/${task.meeting_id}`}>{task.meeting_title}</Link></p>
        <div className="task-quick-meta">{task.assignee_name && <span>Owner: {task.assignee_name}</span>}{(task.due_date || task.due_date_original) && <span>Due: {task.due_date ?? task.due_date_original}</span>}</div>
        <div className="tracked-task-footer"><TaskStatusControl task={task} onUpdate={updateTask} /><Link className="auth-link" href={`/tasks/${task.id}`}>Task details →</Link></div>
      </article>)}
    </section>}
  </main>;
}
