import TaskDashboard from "@/components/TaskDashboard";

type DashboardView = "review" | "follow-through" | "all";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ view?: string | string[] }> }) {
  const params = await searchParams;
  const requestedView = Array.isArray(params.view) ? params.view[0] : params.view;
  const view: DashboardView = requestedView === "review" || requestedView === "follow-through" ? requestedView : "all";
  return <TaskDashboard key={view} initialView={view} />;
}
