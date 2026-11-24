"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";

export default function ExtractMeetingButton({ meetingId }: { meetingId: string }) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function runExtraction() {
    setWorking(true);
    setError("");
    try {
      await apiRequest(`/meetings/${meetingId}/extract`, { method: "POST" });
      router.push(`/review/${meetingId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not extract this meeting.");
      setWorking(false);
    }
  }

  return <div className="extract-action">
    <button className="button" type="button" onClick={runExtraction} disabled={working}>{working ? "Extracting…" : "Extract meeting insights"}</button>
    <p className="form-note">Extraction uses the backend’s configured provider: Ollama for local semantic extraction, or the rule-based fallback on hosted deployments. Check every evidence quote before approval; results remain proposals until you review them.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
