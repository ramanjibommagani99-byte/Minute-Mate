"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";

type Evidence = { id: string; quote_text: string; match_score: number | null };
type Extraction = {
  meeting_id: string;
  meeting_title: string;
  summary: string | null;
  tasks: Array<{ id: string; title: string; description: string | null; assignee_name: string | null; due_date: string | null; due_date_original: string | null; approval_status: string; confidence_score: number; evidence: Evidence[] }>;
  decisions: Array<{ id: string; decision_text: string; evidence_quote: string; confidence_score: number }>;
  risks: Array<{ id: string; risk_text: string; impact: string | null; evidence_quote: string; confidence_score: number }>;
  open_questions: Array<{ id: string; question_text: string; evidence_quote: string; confidence_score: number }>;
};

function EvidenceQuote({ quote }: { quote: string }) {
  return <blockquote className="evidence-quote">“{quote}”</blockquote>;
}

function Confidence({ value }: { value: number }) {
  return <span className="confidence">{Math.round(value * 100)}% confidence</span>;
}

export default function MeetingReview({ meetingId }: { meetingId: string }) {
  const [data, setData] = useState<Extraction | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<Extraction>(`/meetings/${meetingId}/extraction`).then(setData)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load extraction."));
  }, [meetingId]);

  if (error) return <main className="main"><p className="form-error" role="alert">{error}</p></main>;
  if (!data) return <main className="main"><p className="form-note">Loading extracted proposals…</p></main>;

  const isEmpty = !data.summary && !data.tasks.length && !data.decisions.length && !data.risks.length && !data.open_questions.length;
  return <main className="main review-main">
    <Link className="auth-link" href={`/meetings/${meetingId}`}>← Original meeting source</Link>
    <p className="eyebrow">AI extraction · review required</p>
    <h1>{data.meeting_title}</h1>
    {isEmpty ? <div className="placeholder">No extraction has been saved yet. Return to the meeting source to run it.</div> : <>
      {data.summary && <section className="summary-card"><h2>Meeting summary</h2><p>{data.summary}</p></section>}
      <section className="review-section"><h2>Proposed tasks <span className="count-badge">{data.tasks.length}</span></h2>
        {data.tasks.length ? <div className="review-list">{data.tasks.map((task) => <article className="review-card" key={task.id}>
          <div className="review-card-heading"><h3>{task.title}</h3><Confidence value={task.confidence_score} /></div>
          {task.description && <p>{task.description}</p>}
          <dl className="proposal-meta">{task.assignee_name && <div><dt>Suggested owner</dt><dd>{task.assignee_name}</dd></div>}{(task.due_date || task.due_date_original) && <div><dt>Due date</dt><dd>{task.due_date ?? task.due_date_original}</dd></div>}<div><dt>Review state</dt><dd>{task.approval_status.replaceAll("_", " ")}</dd></div></dl>
          {task.evidence.map((evidence) => <EvidenceQuote key={evidence.id} quote={evidence.quote_text} />)}
        </article>)}</div> : <p className="empty-line">No proposed tasks found.</p>}
      </section>
      <ReviewTextSection title="Decisions" empty="No decisions found." items={data.decisions.map((item) => ({ id: item.id, label: item.decision_text, quote: item.evidence_quote, confidence: item.confidence_score }))} />
      <ReviewTextSection title="Risks" empty="No risks found." items={data.risks.map((item) => ({ id: item.id, label: item.risk_text, quote: item.evidence_quote, confidence: item.confidence_score, detail: item.impact ?? undefined }))} />
      <ReviewTextSection title="Open questions" empty="No open questions found." items={data.open_questions.map((item) => ({ id: item.id, label: item.question_text, quote: item.evidence_quote, confidence: item.confidence_score }))} />
      <p className="form-note review-disclaimer">AI results can be incomplete or mistaken. Verify each item against the original source before using it.</p>
    </>}
  </main>;
}

function ReviewTextSection({ title, empty, items }: { title: string; empty: string; items: Array<{ id: string; label: string; quote: string; confidence: number; detail?: string }> }) {
  return <section className="review-section"><h2>{title} <span className="count-badge">{items.length}</span></h2>{items.length ? <div className="review-list">{items.map((item) => <article className="review-card" key={item.id}><div className="review-card-heading"><h3>{item.label}</h3><Confidence value={item.confidence} /></div>{item.detail && <p>{item.detail}</p>}<EvidenceQuote quote={item.quote} /></article>)}</div> : <p className="empty-line">{empty}</p>}</section>;
}
