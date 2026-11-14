import MeetingSource from "@/components/MeetingSource";

export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MeetingSource id={id} />;
}
