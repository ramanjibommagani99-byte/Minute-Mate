"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import TaskStatusControl, { type TaskTracking } from "@/components/TaskStatusControl";
import TaskRemindersPanel from "@/components/TaskRemindersPanel";
import { taskFilterParams } from "@/lib/task-filters";
import CalendarBundleExport from "@/components/CalendarBundleExport";
import TaskApprovalControl from "@/components/TaskApprovalControl";

type ApprovalFilter = "active" | "all" | "review" | "pending" | "approved" | "needs_review" | "rejected";
type StatusFilter = "all" | TaskTracking["status"];
type DashboardView = "review" | "follow-through" | "all";

const approvalLabels: Record<ApprovalFilter, string> = {
  active: "Active proposals and approved tasks",
  all: "All tasks",
  review: "Pending and needs review",
  pending: "Pending approval",
  approved: "Approved",
  needs_review: "Needs review",
  rejected: "Rejected",
};

export default function TaskDashboard({ initialView = "all" }: { initialView?: DashboardView }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskTracking[]>([]);
  const initialApproval: ApprovalFilter = initialView === "review" ? "review" : initialView === "follow-through" ? "approved" : "active";
  const [approvalFilter, setApprovalFilter] = useState<ApprovalFilter>(initialApproval);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function changeView(view: DashboardView) {
    setApprovalFilter(view === "review" ? "review" : view === "follow-through" ? "approved" : "active");
    router.replace(view === "all" ? "/dashboard?view=all" : `/dashboard?view=${view}`, { scroll: false });
  }

  function matchesApprovalFilter(task: TaskTracking) {
    if (approvalFilter === "active" || approvalFilter === "all") return true;
    if (approvalFilter === "review") return task.approval_status === "pending" || task.approval_status === "needs_review";
    return task.approval_status === approvalFilter;
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = taskFilterParams({ approval: approvalFilter, status: statusFilter, owner: ownerFilter, project: projectFilter, dueFrom, dueTo });
    const query = params.size ? `?${params.toString()}` : "";
    const timer = window.setTimeout(() => {
      apiRequest<TaskTracking[]>(`/tasks${query}`, { signal: controller.signal })
      .then(setTasks)
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load tasks.");
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    }, 200);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [approvalFilter, statusFilter, ownerFilter, projectFilter, dueFrom, dueTo]);

  function updateTask(updated: TaskTracking) {
    const approvalMatches = matchesApprovalFilter(updated);
    const statusMatches = statusFilter === "all" || updated.status === statusFilter;
    const ownerMatches = !ownerFilter.trim() || (updated.assignee_name ?? "").toLocaleLowerCase().includes(ownerFilter.trim().toLocaleLowerCase());
    const projectMatches = !projectFilter.trim() || (updated.project_name ?? "").toLocaleLowerCase().includes(projectFilter.trim().toLocaleLowerCase());
    const dueMatches = (!dueFrom || Boolean(updated.due_date && updated.due_date >= dueFrom)) && (!dueTo || Boolean(updated.due_date && updated.due_date <= dueTo));
    setTasks((current) => approvalMatches && statusMatches && ownerMatches && projectMatches && dueMatches
      ? current.map((task) => task.id === updated.id ? updated : task)
      : current.filter((task) => task.id !== updated.id));
  }

  return <main className="main">
    <p className="eyebrow">TASK WORKSPACE</p>
    <h1>Review and follow through</h1>
    <p className="lead">Keep proposed work under review until it is approved, then track the commitments your team accepted.</p>
    <nav className="dashboard-views" aria-label="Task workspace views">
      <button type="button" className={approvalFilter === "review" ? "selected" : ""} aria-pressed={approvalFilter === "review"} onClick={() => changeView("review")}><span>Review queue</span><small>Pending + needs review</small></button>
      <button type="button" className={approvalFilter === "approved" ? "selected" : ""} aria-pressed={approvalFilter === "approved"} onClick={() => changeView("follow-through")}><span>Follow through</span><small>Approved commitments</small></button>
      <button type="button" className={approvalFilter === "active" ? "selected" : ""} aria-pressed={approvalFilter === "active"} onClick={() => changeView("all")}><span>All active work</span><small>Review + tracking</small></button>
    </nav>
    <TaskRemindersPanel />
    <CalendarBundleExport />
    <section className="task-filters" aria-label="Filter tasks">
      <label className="field">Approval state<select value={approvalFilter} onChange={(event) => setApprovalFilter(event.target.value as ApprovalFilter)}>{Object.entries(approvalLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label className="field">Progress status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}><option value="all">All progress states</option><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="overdue">Overdue</option></select></label>
      <label className="field">Owner<input aria-label="Filter by owner" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)} placeholder="Name" /></label>
      <label className="field">Project<input aria-label="Filter by project" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} placeholder="Project name" /></label>
      <label className="field">Due from<input aria-label="Due date from" type="date" value={dueFrom} onChange={(event) => setDueFrom(event.target.value)} /></label>
      <label className="field">Due through<input aria-label="Due date through" type="date" value={dueTo} onChange={(event) => setDueTo(event.target.value)} /></label>
    </section>
    {loading ? <p className="form-note">Loading tasks…</p> : error ? <p className="form-error" role="alert">{error}</p> : tasks.length === 0 ? <div className="placeholder">No tasks match these filters yet. Extract a meeting and review its proposals to get started.</div> : <section className="tracked-task-list" aria-label="Tasks">
      {tasks.map((task) => <article className="tracked-task-card" key={task.id}>
        <div className="tracked-task-heading"><div><p className="eyebrow">{task.approval_status.replaceAll("_", " ")}</p><h2><Link href={`/tasks/${task.id}`}>{task.title}</Link></h2></div><span className={`status-badge status-${task.approval_status}`}>{task.approval_status.replaceAll("_", " ")}</span></div>
        <p className="task-meeting-link">From <Link href={`/meetings/${task.meeting_id}`}>{task.meeting_title}</Link></p>
        <div className="task-quick-meta">{task.assignee_name && <span>Owner: {task.assignee_name}</span>}{(task.due_date || task.due_date_original) && <span>Due: {task.due_date ?? task.due_date_original}</span>}</div>
        {(task.approval_status === "pending" || task.approval_status === "needs_review") && <TaskApprovalControl task={task} onUpdate={updateTask} />}
        <div className="tracked-task-footer"><TaskStatusControl task={task} onUpdate={updateTask} /><Link className="auth-link" href={`/tasks/${task.id}`}>Task details →</Link></div>
      </article>)}
    </section>}
  </main>;
}
