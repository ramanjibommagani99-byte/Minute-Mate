"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api-client";
import TaskReviewCard, { type TaskReviewItem } from "@/components/TaskReviewCard";
import FollowUpEmailDraft from "@/components/FollowUpEmailDraft";
import MinutesExport from "@/components/MinutesExport";

type Extraction = {
  meeting_id: string;
  meeting_title: string;
  summary: string | null;
  tasks: TaskReviewItem[];
  decisions: Array<{ id: string; decision_text: string; evidence_quote: string; confidence_score: number }>;
  risks: Array<{ id: string; risk_text: string; impact: string | null; evidence_quote: string; confidence_score: number }>;
  open_questions: Array<{ id: string; question_text: string; evidence_quote: string; confidence_score: number }>;
};
type MeetingSource = { source_text: string };

function EvidenceQuote({ quote }: { quote: string }) {
  return <blockquote className="evidence-quote">“{quote}”</blockquote>;
}

function Confidence({ value }: { value: number }) {
  return <span className="confidence">{Math.round(value * 100)}% confidence</span>;
}

export default function MeetingReview({ meetingId }: { meetingId: string }) {
  const [data, setData] = useState<Extraction | null>(null);
  const [sourceText, setSourceText] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<{ quote: string; confidence: number } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([apiRequest<Extraction>(`/meetings/${meetingId}/extraction`), apiRequest<MeetingSource>(`/meetings/${meetingId}`)])
      .then(([extraction, meeting]) => { setData(extraction); setSourceText(meeting.source_text); })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load extraction."));
  }, [meetingId]);

  function updateTask(updated: TaskReviewItem) {
    setData((current) => current ? { ...current, tasks: current.tasks.map((task) => task.id === updated.id ? updated : task) } : current);
  }

  function showEvidence(quote: string, confidence: number) {
    setSelectedEvidence({ quote, confidence });
    window.setTimeout(() => document.getElementById("transcript-evidence")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  if (error) return <main className="main"><p className="form-error" role="alert">{error}</p></main>;
  if (!data) return <main className="main"><p className="form-note">Loading extracted proposals…</p></main>;

  const isEmpty = !data.summary && !data.tasks.length && !data.decisions.length && !data.risks.length && !data.open_questions.length;
  return <main className="main review-main">
    <Link className="auth-link" href={`/meetings/${meetingId}`}>← Original meeting source</Link>
    <p className="eyebrow">Extraction · review required</p>
    <h1>{data.meeting_title}</h1>
    {isEmpty ? <div className="placeholder">No extraction has been saved yet. Return to the meeting source to run it.</div> : <>
      {data.summary && <section className="summary-card"><h2>Meeting summary</h2><p>{data.summary}</p></section>}
      <section className="review-section"><h2>Proposed tasks <span className="count-badge">{data.tasks.length}</span></h2>
        {data.tasks.length ? <div className="review-list">{data.tasks.map((task) => <TaskReviewCard task={task} onUpdate={updateTask} onEvidence={showEvidence} key={task.id} />)}</div> : <p className="empty-line">No proposed tasks found.</p>}
      </section>
      <ReviewTextSection title="Decisions" empty="No decisions found." items={data.decisions.map((item) => ({ id: item.id, label: item.decision_text, quote: item.evidence_quote, confidence: item.confidence_score }))} />
      <ReviewTextSection title="Risks" empty="No risks found." items={data.risks.map((item) => ({ id: item.id, label: item.risk_text, quote: item.evidence_quote, confidence: item.confidence_score, detail: item.impact ?? undefined }))} />
      <ReviewTextSection title="Open questions" empty="No open questions found." items={data.open_questions.map((item) => ({ id: item.id, label: item.question_text, quote: item.evidence_quote, confidence: item.confidence_score }))} />
      <section id="transcript-evidence" className="transcript-evidence-panel review-section"><div className="email-draft-heading"><div><p className="eyebrow">Source verification</p><h2>Original transcript</h2></div>{selectedEvidence && <span className="confidence">{Math.round(selectedEvidence.confidence * 100)}% confidence</span>}</div>{selectedEvidence && <p className="form-note">Highlighted evidence: “{selectedEvidence.quote}”</p>}<TranscriptHighlight source={sourceText} quote={selectedEvidence?.quote ?? ""} /></section>
      <FollowUpEmailDraft meetingTitle={data.meeting_title} approvedTasks={data.tasks.filter((task) => task.approval_status === "approved")} decisions={data.decisions} openQuestions={data.open_questions} />
      <MinutesExport title={data.meeting_title} summary={data.summary} sourceText={sourceText} tasks={data.tasks} decisions={data.decisions.map((item) => ({ label: item.decision_text, quote: item.evidence_quote, confidence: item.confidence_score }))} risks={data.risks.map((item) => ({ label: item.risk_text, quote: item.evidence_quote, confidence: item.confidence_score, detail: item.impact ?? undefined }))} questions={data.open_questions.map((item) => ({ label: item.question_text, quote: item.evidence_quote, confidence: item.confidence_score }))} />
      <p className="form-note review-disclaimer">AI results can be incomplete or mistaken. Verify each item against the original source before using it.</p>
    </>}
  </main>;
}

function TranscriptHighlight({ source, quote }: { source: string; quote: string }) {
  if (!source) return <p className="empty-line">The original source is unavailable.</p>;
  const start = quote ? source.toLocaleLowerCase().indexOf(quote.toLocaleLowerCase()) : -1;
  if (start < 0) return <pre className="transcript-source">{source}</pre>;
  const end = start + quote.length;
  return <pre className="transcript-source">{source.slice(0, start)}<mark className="transcript-mark">{source.slice(start, end)}</mark>{source.slice(end)}</pre>;
}

function ReviewTextSection({ title, empty, items }: { title: string; empty: string; items: Array<{ id: string; label: string; quote: string; confidence: number; detail?: string }> }) {
  return <section className="review-section"><h2>{title} <span className="count-badge">{items.length}</span></h2>{items.length ? <div className="review-list">{items.map((item) => <article className="review-card" key={item.id}><div className="review-card-heading"><h3>{item.label}</h3><Confidence value={item.confidence} /></div>{item.detail && <p>{item.detail}</p>}<EvidenceQuote quote={item.quote} /></article>)}</div> : <p className="empty-line">{empty}</p>}</section>;
}
