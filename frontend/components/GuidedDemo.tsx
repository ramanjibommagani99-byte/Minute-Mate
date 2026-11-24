"use client";

import Link from "next/link";
import { useState } from "react";

type Decision = "pending" | "approved" | "rejected" | "needs_review";
type Progress = "not_started" | "in_progress" | "completed";

const transcript = "Maya: We agreed to launch the updated onboarding guide on November 24. Liam: I will prepare the revised guide and send it to Maya by November 20. Maya: I will review and approve the copy by November 22. Liam: We decided not to include the partner setup flow in this launch. Maya: The launch could slip if Legal approves the privacy text late. Liam: Do we need a separate enterprise version? We have not decided.";

const starterTasks = [
  { id: "guide", title: "Prepare and send the revised onboarding guide", owner: "Liam", due: "Nov 20, 2026", evidence: "I will prepare the revised guide and send it to Maya by November 20.", confidence: 96 },
  { id: "copy", title: "Review and approve the onboarding guide copy", owner: "Maya", due: "Nov 22, 2026", evidence: "I will review and approve the copy by November 22.", confidence: 94 },
];

const steps = ["Capture", "Review", "Follow through"] as const;
type Step = 0 | 1 | 2;

export default function GuidedDemo() {
  const [step, setStep] = useState<Step>(0);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({ guide: "pending", copy: "pending" });
  const [progress, setProgress] = useState<Record<string, Progress>>({ guide: "not_started", copy: "not_started" });

  const approvedCount = Object.values(decisions).filter((value) => value === "approved").length;
  function decide(id: string, decision: Decision) {
    setDecisions((current) => ({ ...current, [id]: decision }));
  }

  return <main className="main guided-demo">
    <div className="demo-heading">
      <div><p className="eyebrow"><span className="eyebrow-line" />GUIDED PRODUCT DEMO</p><h1>From conversation<br className="desktop-break" /> to clear next steps.</h1><p className="lead">Walk through one meeting, check the source behind each proposal, and track the work you approve.</p></div>
      <span className="demo-mode-badge"><span className="privacy-dot" /> SAMPLE DATA · LOCAL DEMO</span>
    </div>

    <div className="demo-disclaimer"><span aria-hidden="true">ⓘ</span><p><strong>This is a safe interactive demo.</strong> This sample skips sign-in and AI setup; its clicks only change this page. In the real task workspace, Slack remains a clearly labeled simulation. Calendar export creates a real .ics file for you to import; it is not added automatically.</p></div>

    <nav className="demo-stepper" aria-label="Demo steps">
      {steps.map((label, index) => <div className={`demo-step${step === index ? " current" : ""}${step > index ? " complete" : ""}`} key={label}>
        <span className="demo-step-number">{step > index ? "✓" : `0${index + 1}`}</span><span>{label}</span>
      </div>)}
    </nav>

    {step === 0 && <section className="demo-panel">
      <div className="demo-panel-heading"><div><p className="eyebrow">STEP 01 · MEETING SOURCE</p><h2>Weekly onboarding launch sync</h2></div><span className="demo-date">NOV 18, 2026 · 18 MIN</span></div>
      <div className="demo-source-meta"><span>PRODUCT LAUNCH</span><span>6 PARTICIPANTS</span><span>TRANSCRIPT</span></div>
      <blockquote className="demo-transcript">{transcript}</blockquote>
      <div className="demo-panel-footer"><p>MinuteMate keeps the original conversation available as you review what it found.</p><button className="button" type="button" onClick={() => setStep(1)}>Extract sample insights <span aria-hidden="true">→</span></button></div>
    </section>}

    {step === 1 && <section className="demo-review">
      <div className="demo-panel-heading"><div><p className="eyebrow">STEP 02 · HUMAN REVIEW</p><h2>Proposed work</h2></div><span className="demo-count">{approvedCount} APPROVED</span></div>
      <p className="demo-helper">Check each evidence quote against the source, then choose what becomes a commitment.</p>
      {starterTasks.map((task) => <article className="demo-task" key={task.id}>
        <div className="demo-task-title"><div><p className="eyebrow">PROPOSED TASK</p><h3>{task.title}</h3></div><span className={`status-badge status-${decisions[task.id]}`}>{decisions[task.id].replaceAll("_", " ")}</span></div>
        <p className="demo-task-description">Suggested owner: <strong>{task.owner}</strong><span>·</span> Due: <strong>{task.due}</strong><span>·</span> Confidence: <strong>{task.confidence}%</strong></p>
        <blockquote className="evidence-quote">“{task.evidence}”</blockquote>
        <div className="demo-trust-row"><span className="trust-check valid">✓ Evidence quote</span><span className="trust-check valid">✓ Date grounded</span><span className="trust-check valid">✓ Confidence range</span></div>
        {decisions[task.id] === "pending" ? <div className="review-actions"><button type="button" className="button" onClick={() => decide(task.id, "approved")}>Approve</button><button type="button" className="button secondary" onClick={() => decide(task.id, "needs_review")}>Flag for review</button><button type="button" className="button danger" onClick={() => decide(task.id, "rejected")}>Reject</button></div> : <div className="demo-decision-note">{decisions[task.id] === "approved" ? "Approved in this sample demo; ready for follow-through." : decisions[task.id] === "rejected" ? "Rejected in this sample demo; it will not enter tracking." : "Flagged in this sample demo for another look."} <button type="button" className="history-toggle" onClick={() => decide(task.id, "pending")}>Undo</button></div>}
      </article>)}
      <div className="demo-insights">
        <article><span className="demo-insight-icon">✓</span><div><p className="eyebrow">DECISION</p><h3>Exclude the partner setup flow from this launch</h3><blockquote className="evidence-quote">“We decided not to include the partner setup flow in this launch.”</blockquote></div></article>
        <article><span className="demo-insight-icon risk">!</span><div><p className="eyebrow">RISK</p><h3>Launch timing depends on privacy text approval</h3><blockquote className="evidence-quote">“The launch could slip if Legal approves the privacy text late.”</blockquote></div></article>
        <article><span className="demo-insight-icon question">?</span><div><p className="eyebrow">OPEN QUESTION</p><h3>Is a separate enterprise version needed?</h3><blockquote className="evidence-quote">“Do we need a separate enterprise version? We have not decided.”</blockquote></div></article>
      </div>
      <div className="demo-panel-footer"><button type="button" className="button secondary" onClick={() => setStep(0)}>← Back to source</button><button type="button" className="button" disabled={!approvedCount} onClick={() => setStep(2)}>Continue with {approvedCount} approved <span aria-hidden="true">→</span></button></div>
      {!approvedCount && <p className="demo-inline-note">Approve at least one proposal to see it in follow-through.</p>}
    </section>}

    {step === 2 && <section className="demo-review">
      <div className="demo-panel-heading"><div><p className="eyebrow">STEP 03 · FOLLOW THROUGH</p><h2>Approved commitments</h2></div><span className="demo-count">{approvedCount} TRACKED</span></div>
      <p className="demo-helper">Only proposals you approved appear here. Update their progress as work moves forward.</p>
      <div className="demo-follow-list">{starterTasks.filter((task) => decisions[task.id] === "approved").map((task) => <article className="demo-follow-card" key={task.id}>
        <div><span className="status-badge status-approved">approved</span><h3>{task.title}</h3><p>Owner: {task.owner} <span>·</span> Due: {task.due}</p><blockquote className="evidence-quote">“{task.evidence}”</blockquote></div>
        <label className="status-select-label">Progress status<select value={progress[task.id]} onChange={(event) => setProgress((current) => ({ ...current, [task.id]: event.target.value as Progress }))}><option value="not_started">Not started</option><option value="in_progress">In progress</option><option value="completed">Completed</option></select></label>
      </article>)}</div>
      <div className="demo-finish-banner"><span className="privacy-dot"/><p><strong>Approval boundary demonstrated.</strong> Rejected and flagged proposals were kept out of follow-through.</p></div>
      <div className="demo-panel-footer"><button type="button" className="button secondary" onClick={() => setStep(1)}>← Back to review</button><div className="demo-final-actions"><button type="button" className="history-toggle" onClick={() => { setDecisions({ guide: "pending", copy: "pending" }); setProgress({ guide: "not_started", copy: "not_started" }); setStep(0); }}>Restart demo</button><Link href="/meetings/new" className="button">Use my own meeting <span aria-hidden="true">→</span></Link></div></div>
    </section>}

    <p className="demo-footer-note">Sample content is provided to demonstrate the MinuteMate workflow. Use <Link href="/meetings/new">New meeting</Link> to save a real transcript to your account.</p>
  </main>;
}
