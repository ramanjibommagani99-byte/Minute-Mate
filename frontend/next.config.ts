import type { NextConfig } from "next";

const backendOrigin = (process.env.BACKEND_API_ORIGIN ?? "http://127.0.0.1:8001").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Vercel expects the standard Next.js output directory. Locally, use a
  // separate directory to avoid stale .next files held by OneDrive sync.
  distDir: process.env.VERCEL === "1" ? ".next" : ".next-minutemate",
  async rewrites() {
    // On Vercel, the repository-level Services routing sends /api to FastAPI.
    // Keep this local proxy for development only; localhost is not the backend
    // inside a hosted frontend deployment.
    if (process.env.VERCEL === "1") return [];
    return [{ source: "/api/:path*", destination: `${backendOrigin}/:path*` }];
  },
};

export default nextConfig;
