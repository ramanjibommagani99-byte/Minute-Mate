import Link from "next/link";

const steps = [
  { title: "Capture the discussion", text: "Start with a meeting transcript or notes, or transcribe an audio file when an API key is configured." },
  { title: "Review with evidence", text: "Inspect proposed tasks alongside the words that support them before approving any commitment." },
  { title: "Track what was agreed", text: "Keep approved work visible with a clear owner, deadline, and follow-up status." },
];

export default function HomePage() {
  return (
    <main className="main">
      <p className="eyebrow">Meeting follow-through, made clear</p>
      <h1>Turn meeting discussions into accountable action.</h1>
      <p className="lead">MinuteMate is being built to turn meeting transcripts into evidence-linked task proposals that a person can review before they become team commitments.</p>
      <div className="actions">
        <Link className="button" href="/meetings/new">Start with a meeting</Link>
        <Link className="button secondary" href="/dashboard">View dashboard</Link>
      </div>
      <section className="grid" aria-label="MinuteMate workflow">
        {steps.map((step) => <article className="card" key={step.title}><h2>{step.title}</h2><p>{step.text}</p></article>)}
      </section>
    </main>
  );
}
