"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { API_URL } from "@/lib/api-client";

type AuthFormProps = { mode: "login" | "register" };

type ApiErrorBody = {
  detail?: unknown;
};

function getRequestError(body: ApiErrorBody, status: number): string {
  if (typeof body.detail === "string" && body.detail.trim()) {
    return body.detail;
  }

  if (Array.isArray(body.detail)) {
    const messages = body.detail.flatMap((issue) => {
      if (!issue || typeof issue !== "object") return [];
      const item = issue as { loc?: unknown; msg?: unknown };
      if (typeof item.msg !== "string") return [];

      const location = Array.isArray(item.loc) ? item.loc : [];
      const field = location
        .filter((part): part is string => typeof part === "string" && part !== "body")
        .map((part) => part.replaceAll("_", " "))
        .join(" ");
      const label = field ? `${field.charAt(0).toUpperCase()}${field.slice(1)}: ` : "";
      return [`${label}${item.msg}`];
    });

    if (messages.length) return messages.join(" ");
  }

  if (status >= 500) {
    return "MinuteMate’s server could not complete this request. Please try again; if it continues, check the Vercel Runtime Logs.";
  }
  if (status === 404 || status === 502 || status === 503) {
    return "MinuteMate could not reach the account service. Please try again shortly.";
  }
  return "The request was rejected. Check your name, email, and password, then try again.";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (isSubmitting) return;
    setIsSubmitting(true);
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload: Record<string, string> = {
      email: String(formData.get("email") ?? "").trim(),
      password: String(formData.get("password") ?? ""),
    };
    if (isRegister) payload.display_name = String(formData.get("display_name") ?? "").trim();

    try {
      const response = await fetch(`${API_URL}/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const responseBody: unknown = await response.json().catch(() => null);
      const result = responseBody && typeof responseBody === "object"
        ? responseBody as ApiErrorBody
        : {};
      if (!response.ok) {
        setError(getRequestError(result, response.status));
        return;
      }
      if (isRegister) {
        setSuccess("Account created. You can now sign in.");
        form.reset();
        return;
      }
      window.location.assign("/dashboard");
    } catch {
      setError("MinuteMate could not reach the API. Check that the backend is running.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">MinuteMate account</p>
      <h1>{isRegister ? "Create your account" : "Welcome back"}</h1>
      <p className="form-note">
        {isRegister ? "Create an organizer account to manage meeting follow-through." : "Sign in to review and track your team’s meeting actions."}
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        {isRegister && <label className="field">Name<input autoComplete="name" name="display_name" required minLength={2} maxLength={100} /></label>}
        <label className="field">Email<input autoComplete="email" name="email" type="email" required maxLength={320} /></label>
        <label className="field">Password<input autoComplete={isRegister ? "new-password" : "current-password"} name="password" type="password" required minLength={isRegister ? 10 : 1} maxLength={72} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {success && <p className="form-success" role="status">{success} <Link className="auth-link" href="/login">Sign in</Link></p>}
        <button className="button" type="submit" disabled={isSubmitting}>{isSubmitting ? (isRegister ? "Creating account…" : "Signing in…") : (isRegister ? "Create account" : "Sign in")}</button>
        {isSubmitting && <p className="form-note" role="status">Connecting securely to MinuteMate…</p>}
      </form>
      <p className="form-note" style={{ marginTop: 20 }}>
        {isRegister ? <>Already registered? <Link className="auth-link" href="/login">Sign in</Link></> : <>New to MinuteMate? <Link className="auth-link" href="/register">Create an account</Link></>}
      </p>
    </section>
  );
}
