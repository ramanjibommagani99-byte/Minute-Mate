import TaskDetails from "@/components/TaskDetails";

export default async function TaskDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetails taskId={id} />;
}
