export type TaskFilterValues = {
  approval: string;
  status: string;
  owner: string;
  project: string;
  dueFrom: string;
  dueTo: string;
};

export function taskFilterParams(filters: TaskFilterValues): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.approval !== "active") params.set("approval_status", filters.approval);
  if (filters.status !== "all") params.set("task_status", filters.status);
  if (filters.owner.trim()) params.set("assignee_name", filters.owner.trim());
  if (filters.project.trim()) params.set("project_name", filters.project.trim());
  if (filters.dueFrom) params.set("due_date_from", filters.dueFrom);
  if (filters.dueTo) params.set("due_date_to", filters.dueTo);
  return params;
}
