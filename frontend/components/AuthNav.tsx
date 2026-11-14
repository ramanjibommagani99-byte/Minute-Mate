"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { API_URL } from "@/lib/api-client";

type User = { display_name: string };

export default function AuthNav() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_URL}/auth/me`, { credentials: "include", signal: controller.signal })
      .then((response) => response.ok ? response.json() : null)
      .then((value) => { if (!controller.signal.aborted) setUser(value); })
      .catch(() => { if (!controller.signal.aborted) setUser(null); });
    return () => controller.abort();
  }, []);

  async function signOut() {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }).catch(() => undefined);
    setUser(null);
    router.replace("/login");
    router.refresh();
  }

  if (!user) return <><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></>;
  return <><span aria-label={`Signed in as ${user.display_name}`}>Hi, {user.display_name}</span><button className="nav-button" onClick={signOut} type="button">Sign out</button></>;
}
