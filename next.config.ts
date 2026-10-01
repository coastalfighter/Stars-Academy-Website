import type { NextConfig } from "next";
import { REPORTING_ENDPOINTS, buildCsp } from "./src/lib/security/csp";
import { nextRedirects } from "./src/lib/launch/legacyRedirects";
import { isIndexable } from "./src/lib/launch/indexing";

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
    // Photos uploaded in the CMS. Visitors fetch them from this site's own
    // image optimizer (no third-party requests), which also re-encodes them
    // and drops embedded metadata such as camera GPS positions.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          ...securityHeaders,
          // Belt and braces with robots.txt: previews say noindex on every response.
          ...(isIndexable() ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]),
        ],
      },
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
    // Every page of the previous (Wix) site keeps working. See src/lib/launch/legacyRedirects.ts.
    return nextRedirects();
  },
};

export default nextConfig;
