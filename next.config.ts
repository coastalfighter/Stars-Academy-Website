import type { NextConfig } from "next";
import { REPORTING_ENDPOINTS, buildCsp } from "./src/lib/security/csp";

const isDev = process.env.NODE_ENV !== "production";

const securityHeaders = [
  { key: "Content-Security-Policy", value: buildCsp({ dev: isDev }) },
  { key: "Reporting-Endpoints", value: REPORTING_ENDPOINTS },
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
  // Lets the E2E suite build a second, CMS-enabled copy alongside the default one.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // One root layout per language (route groups) needs a routing-level 404.
    globalNotFound: true,
  },
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
      {
        // Staff-only pages: never indexed, never cached by browsers or CDNs.
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
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
    ];
  },
};

export default nextConfig;
