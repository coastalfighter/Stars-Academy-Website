import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { isIndexable } from "@/lib/launch/indexing";

export default function robots(): MetadataRoute.Robots {
  // Preview and development deployments must never be indexed.
  if (!isIndexable()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
