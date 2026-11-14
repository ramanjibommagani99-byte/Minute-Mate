export default async function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="main"><p className="eyebrow">Meeting detail</p><h1>Meeting {id}</h1><div className="placeholder">Meeting source and extraction details will appear here.</div></main>;
}
