import type { NextConfig } from "next";

/**
 * Next.js Application Configuration for Lumora Web.
 * 
 * Required Environment Variables (configured in .env.local for local dev):
 * 
 * 1. NEXT_PUBLIC_API_URL:
 *    Points to the backend REST API URL (e.g. http://localhost:8000). Used by
 *    Axios/API handlers to trigger challenges, sign operations, and session verify.
 * 
 * 2. NEXT_PUBLIC_ENABLE_DEMO_WALLET:
 *    Gated developer-only helper ('true'/'false'). When true, enables the local 
 *    demo wallet interface which fabricates mock signatures. MUST be false in production.
 */
const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
