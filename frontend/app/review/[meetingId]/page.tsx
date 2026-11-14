import MeetingReview from "@/components/MeetingReview";

export default async function ReviewPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params;
  return <MeetingReview meetingId={meetingId} />;
}
