"use client";

import { useState } from "react";
import type { TaskReviewItem } from "@/components/TaskReviewCard";

type Insight = { label: string; quote: string; confidence: number; detail?: string };
type Props = { title: string; summary: string | null; sourceText: string; tasks: TaskReviewItem[]; decisions: Insight[]; risks: Insight[]; questions: Insight[] };

function list(items: Insight[]) {
  return items.length ? items.map((item) => `- ${item.label}${item.detail ? ` — ${item.detail}` : ""}\n  Evidence: “${item.quote}” (${Math.round(item.confidence * 100)}% confidence)`).join("\n") : "- None recorded";
}

export default function MinutesExport({ title, summary, sourceText, tasks, decisions, risks, questions }: Props) {
  const [message, setMessage] = useState("");
  const markdown = `# ${title}\n\n${summary ? `## Summary\n\n${summary}\n\n` : ""}## Tasks\n\n${tasks.length ? tasks.map((task) => `- ${task.title} [${task.approval_status.replaceAll("_", " ")}]${task.assignee_name ? ` — ${task.assignee_name}` : ""}${task.due_date ? ` (due ${task.due_date})` : ""}\n  Evidence: “${task.evidence[0]?.quote_text ?? ""}” (${Math.round(task.confidence_score * 100)}% confidence)`).join("\n") : "- None recorded"}\n\n## Decisions\n\n${list(decisions)}\n\n## Risks\n\n${list(risks)}\n\n## Open questions\n\n${list(questions)}\n\n## Original source\n\n${sourceText}\n`;

  function downloadMarkdown() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "meeting-minutes"}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Markdown minutes downloaded.");
  }

  return <section className="minutes-export">
    <div className="email-draft-heading"><div><p className="eyebrow">Take the record with you</p><h2>Export minutes</h2></div><div className="export-actions"><button className="button secondary" type="button" onClick={downloadMarkdown}>Download Markdown</button><button className="button" type="button" onClick={() => window.print()}>Print / Save PDF</button></div></div>
    <p className="form-note">PDF uses your browser’s print dialog. Choose “Save as PDF” to download a copy.</p>
    {message && <p className="form-success" role="status">{message}</p>}
    <details className="minutes-preview"><summary>Preview printable minutes</summary><article className="minutes-printable"><p className="minutes-brand">MINUTEMATE · MEETING MINUTES</p><h1>{title}</h1>{summary && <section><h2>Summary</h2><p>{summary}</p></section>}<section><h2>Tasks</h2><ul>{tasks.map((task) => <li key={task.id}><strong>{task.title}</strong> · {task.approval_status.replaceAll("_", " ")}{task.assignee_name ? ` — ${task.assignee_name}` : ""}{task.due_date ? ` · Due ${task.due_date}` : ""}<small>Evidence: “{task.evidence[0]?.quote_text ?? ""}” · {Math.round(task.confidence_score * 100)}% confidence</small></li>)}</ul>{!tasks.length && <p>None recorded.</p>}</section>{[["Decisions", decisions], ["Risks", risks], ["Open questions", questions]].map(([heading, items]) => <section key={heading as string}><h2>{heading as string}</h2><ul>{(items as Insight[]).map((item, index) => <li key={`${heading}-${index}`}><strong>{item.label}</strong>{item.detail && ` — ${item.detail}`}<small>Evidence: “{item.quote}” · {Math.round(item.confidence * 100)}% confidence</small></li>)}</ul>{!(items as Insight[]).length && <p>None recorded.</p>}</section>)}<section><h2>Original meeting source</h2><pre>{sourceText}</pre></section></article></details>
  </section>;
}
