"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import TaskStatusControl, { type TaskTracking } from "@/components/TaskStatusControl";

export default function TaskDetails({ taskId }: { taskId: string }) {
  const [task, setTask] = useState<TaskTracking | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<TaskTracking>(`/tasks/${taskId}`).then(setTask)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load task details."));
  }, [taskId]);

  if (error) return <main className="main"><p className="form-error" role="alert">{error}</p><Link className="auth-link" href="/dashboard">Back to tasks</Link></main>;
  if (!task) return <main className="main"><p className="form-note">Loading task…</p></main>;

  return <main className="main task-details">
    <Link className="auth-link" href="/dashboard">← Task dashboard</Link>
    <p className="eyebrow">{task.approval_status.replaceAll("_", " ")}</p>
    <h1>{task.title}</h1>
    <p className="lead">From <Link className="auth-link" href={`/meetings/${task.meeting_id}`}>{task.meeting_title}</Link></p>
    {task.description && <p className="task-description">{task.description}</p>}
    <dl className="task-detail-meta">{task.assignee_name && <div><dt>Suggested owner</dt><dd>{task.assignee_name}</dd></div>}{task.meeting_date && <div><dt>Meeting date</dt><dd>{new Date(task.meeting_date).toLocaleString()}</dd></div>}{(task.due_date || task.due_date_original) && <div><dt>Due date</dt><dd>{task.due_date ?? task.due_date_original}</dd></div>}<div><dt>Approval</dt><dd>{task.approval_status.replaceAll("_", " ")}</dd></div><div><dt>Progress</dt><dd>{task.status.replaceAll("_", " ")}</dd></div><div><dt>Model confidence</dt><dd>{Math.round(task.confidence_score * 100)}%</dd></div></dl>
    <section className="task-progress-panel"><h2>Update progress</h2><TaskStatusControl task={task} onUpdate={setTask} /></section>
    <section className="task-evidence-section"><h2>Supporting source evidence</h2>{task.evidence.length ? task.evidence.map((item) => <article className="source-card" key={item.id}><blockquote className="evidence-quote">“{item.quote_text}”</blockquote>{item.timestamp_seconds !== null && <p className="source-timestamp">Timestamp: {formatTimestamp(item.timestamp_seconds)}</p>}</article>) : <div className="placeholder">No evidence quote is attached.</div>}</section>
    {task.trust.warnings.length > 0 && <section className="task-trust-panel"><h2>Review notes</h2>{task.trust.warnings.map((warning) => <p className="trust-warning" key={warning}>{warning}</p>)}</section>}
  </main>;
}

function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
