"use client";

import { useState } from "react";
import type { TaskReviewItem } from "@/components/TaskReviewCard";

type Props = {
  meetingTitle: string;
  approvedTasks: TaskReviewItem[];
  decisions: Array<{ decision_text: string }>;
  openQuestions: Array<{ question_text: string }>;
};

export default function FollowUpEmailDraft({ meetingTitle, approvedTasks, decisions, openQuestions }: Props) {
  const [opened, setOpened] = useState(false);
  const [message, setMessage] = useState("");
  const [recipient, setRecipient] = useState("");
  const subject = `Follow-up: ${meetingTitle}`;
  const sections = [
    "Hi,\n\nHere is the recap and agreed follow-up from our meeting:",
    approvedTasks.length ? `\n\nApproved action items:\n${approvedTasks.map((task) => `• ${task.title}${task.assignee_name ? ` — ${task.assignee_name}` : ""}${task.due_date ? ` (due ${task.due_date})` : ""}`).join("\n")}` : "",
    decisions.length ? `\n\nDecisions:\n${decisions.map((item) => `• ${item.decision_text}`).join("\n")}` : "",
    openQuestions.length ? `\n\nOpen questions:\n${openQuestions.map((item) => `• ${item.question_text}`).join("\n")}` : "",
    "\n\nPlease reply with any corrections or missing details.\n\nBest,",
  ];
  const body = sections.join("");
  const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setMessage("Draft copied. Paste it into your email to review and send.");
    } catch {
      setMessage("Clipboard access was blocked. Select and copy the draft below.");
    }
  }

  return <section className="email-draft-card">
    <div className="email-draft-heading"><div><p className="eyebrow">Client-ready follow-up</p><h2>Recap email</h2></div><button className="button secondary" type="button" onClick={() => { setOpened((current) => !current); setMessage(""); }}>{opened ? "Hide draft" : "Draft follow-up email"}</button></div>
    <p className="form-note">Only approved tasks are included. The draft opens in your email app or can be copied; MinuteMate never sends it.</p>
    {opened && <div className="email-draft-preview"><label className="field">Client email <span className="optional">Optional</span><input type="email" value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="client@example.com" /></label><p><strong>Subject:</strong> {subject}</p><pre>{body}</pre><div className="export-actions"><button className="button secondary" type="button" onClick={copyDraft}>Copy draft</button><a className="button" href={mailto}>Open in email app</a></div>{message && <p className="form-success" role="status">{message}</p>}</div>}
  </section>;
}
