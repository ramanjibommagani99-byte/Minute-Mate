import type { NextConfig } from "next";

const backendOrigin = (process.env.BACKEND_API_ORIGIN ?? "http://127.0.0.1:8001").replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Keep this app's generated files separate from stale .next files that can
  // be held by OneDrive while it synchronizes the workspace.
  distDir: ".next-minutemate",
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendOrigin}/:path*` }];
  },
};

export default nextConfig;
