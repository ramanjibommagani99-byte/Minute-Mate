// Use the frontend origin for API requests so the HttpOnly session cookie is
// shared with the frontend route guard on both localhost and 127.0.0.1.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    throw new Error(body?.detail ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function getApiHealth(): Promise<{ status: string; service: string }> {
  const response = await fetch(`${API_URL}/health`, { cache: "no-store" });
  if (!response.ok) throw new Error(`API health check failed (${response.status})`);
  return response.json();
}
