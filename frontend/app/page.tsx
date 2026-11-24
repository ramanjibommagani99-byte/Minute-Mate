import Link from "next/link";
import MeetingsList from "@/components/MeetingsList";

export default function HomePage() {
  return (
    <main className="main overview-main">
      <div className="overview-heading">
        <div><p className="eyebrow"><span className="eyebrow-line" />YOUR MEETING COMMAND CENTER</p>
          <h1>Good work starts<br className="desktop-break" /> with a clear room.</h1>
          <p className="lead">Bring the conversation in. Review every commitment with its evidence. Keep the next steps moving.</p>
        </div>
        <div className="overview-actions"><Link className="button" href="/meetings/new"><span aria-hidden="true">＋</span> Start a meeting</Link><Link className="button secondary" href="/demo">Try the guided demo <span aria-hidden="true">↗</span></Link></div>
      </div>
      <section className="overview-stats" aria-label="Workspace workflow">
        <Link href="/meetings/new" className="overview-stat"><span className="stat-icon mint">01</span><span><strong>Capture</strong><small>Transcript or notes</small></span><span className="stat-arrow">↗</span></Link>
        <div className="stat-connector" aria-hidden="true">········</div>
        <Link href="/dashboard?view=review" className="overview-stat"><span className="stat-icon blue">02</span><span><strong>Review</strong><small>Evidence before approval</small></span><span className="stat-arrow">↗</span></Link>
        <div className="stat-connector" aria-hidden="true">········</div>
        <Link href="/dashboard?view=follow-through" className="overview-stat"><span className="stat-icon violet">03</span><span><strong>Follow through</strong><small>Track the agreed work</small></span><span className="stat-arrow">↗</span></Link>
      </section>
      <section className="meeting-section overview-meetings">
        <div className="section-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Your meetings</h2></div><Link href="/meetings/new" className="text-link">Add a meeting <span aria-hidden="true">↗</span></Link></div>
        <MeetingsList />
      </section>
      <section className="overview-note"><span className="privacy-dot"/><p><strong>Human approval stays in the loop.</strong> Proposed tasks never become commitments until you review and approve them.</p><Link href="/dashboard?view=all">Open task dashboard <span aria-hidden="true">→</span></Link></section>
    </main>
  );
}
