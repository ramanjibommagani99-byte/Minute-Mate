import type { NextConfig } from "next";

const backendOrigin = (process.env.BACKEND_API_ORIGIN ?? "http://127.0.0.1:8001").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Vercel expects the standard Next.js output directory. Locally, use a
  // separate directory to avoid stale .next files held by OneDrive sync.
  distDir: process.env.VERCEL === "1" ? ".next" : ".next-minutemate",
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendOrigin}/:path*` }];
  },
};

export default nextConfig;
