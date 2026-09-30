import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { STATIC_ROUTES } from "@/app/sitemap";
import { primaryNav, utilityNav, pathways, site } from "@/content/site";

const APP = join(process.cwd(), "src", "app");

/** All static page routes in src/app (dynamic segments and api excluded). */
function pageRoutes(dir = APP): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name === "api" || name.startsWith("[") || name.startsWith("(") || name.startsWith("_")) continue;
    if (existsSync(join(full, "page.tsx"))) out.push(`/${relative(APP, full).split(sep).join("/")}`);
    out.push(...pageRoutes(full));
  }
  return out;
}

describe("routes", () => {
  const sitemapPaths = new Set(STATIC_ROUTES.map((r) => r.path));
  const routes = ["/", ...pageRoutes()];

  it("lists every page in the sitemap", () => {
    for (const r of routes) expect(sitemapPaths, `missing ${r}`).toContain(r);
  });

  it("only lists pages that exist", () => {
    for (const p of sitemapPaths) expect(routes, `no page for ${p}`).toContain(p);
  });

  it("points every navigation link at a real page", () => {
    const links = [...primaryNav, ...utilityNav, ...pathways].map((l) => l.href.split("#")[0] || "/");
    for (const href of links) expect(routes, `broken nav link ${href}`).toContain(href);
  });

  it("uses the organisation's real domain by default", () => {
    expect(site.url).toMatch(/mystarsacademy\.org/);
  });
});
