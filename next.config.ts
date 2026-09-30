import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 * - Fonts are self-hosted by next/font, so no third-party font hosts are needed.
 * - The 3D scene creates blob: workers/textures, so blob: is allowed for those.
 * - Next.js injects inline bootstrapping scripts; 'unsafe-inline' is required
 *   unless the app moves to nonce-based CSP via a proxy (which forces dynamic
 *   rendering and loses static generation for this marketing site).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
  async redirects() {
    // Preserve the URLs of the previous site so existing links and search
    // results keep working after launch.
    return [
      { source: "/speech-therapy", destination: "/services/speech-therapy", permanent: true },
      { source: "/occupational-therapy", destination: "/services/occupational-therapy", permanent: true },
      { source: "/physical-therapy", destination: "/services/physical-therapy", permanent: true },
      { source: "/nursing", destination: "/services/nursing-care", permanent: true },
      { source: "/classrooms", destination: "/services/developmental-classrooms", permanent: true },
      { source: "/contact-us", destination: "/schedule-a-tour", permanent: false },
    ];
  },
};

export default nextConfig;
