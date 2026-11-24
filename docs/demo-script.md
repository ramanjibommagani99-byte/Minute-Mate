# MinuteMate guided demo

## Open the sample

Open `/demo` from the home page with **Try the guided demo**. The sample is self-contained and does not require an account, database, Ollama model, transcription key, or network request.

## Three-minute walkthrough

1. **Capture:** show the sample onboarding launch transcript and its meeting metadata. Choose **Extract sample insights**.
2. **Review:** compare each proposed task with its source quote, owner, due date, confidence, and trust checks. Approve one task and flag or reject another.
3. **Follow through:** continue to see that only approved tasks are tracked. Change progress to demonstrate status updates.
4. **Explain the boundary:** the sample stays in browser state and never creates a real meeting, approval, reminder, or integration event. In an approved real task, the Slack action is simulated and labeled; the calendar control downloads a real `.ics` event that the organizer can import. Use **New meeting** for the authenticated persisted workflow.
5. **Show the back-office loop:** on a real meeting review, click a task's evidence link to highlight its source sentence, draft a recap email from approved tasks and meeting outcomes, then export Markdown or print the minutes to PDF. At the next meeting, the new-meeting page surfaces prior open questions and overdue approved tasks. The dashboard `.ics` export bundles approved task deadlines and scheduled reminders for user-controlled import.

## What this demonstrates

- A transcript is the basis for proposed tasks, a decision, a risk, and an open question.
- Evidence is visible beside each proposal so an organizer can inspect it before approval.
- Approval controls what appears in follow-through.
- The demo route is an interactive product walkthrough using fixed sample data; it does not invoke AI extraction or contact an external integration.
- Hosted production extraction uses the explicit-pattern fallback, so the hosted demo does not depend on Ollama. Local Ollama semantic extraction remains available for the pitch and local development.
