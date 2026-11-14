export default async function ReviewPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params;
  return <main className="main"><p className="eyebrow">Human review</p><h1>Review proposed tasks</h1><div className="placeholder">Review proposals for meeting {meetingId} will appear here.</div></main>;
}
