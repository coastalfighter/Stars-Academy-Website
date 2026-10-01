import { readdirSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";
import sitemap from "@/app/sitemap";
import { site } from "@/content/site";
import { getContent } from "@/content";
import { LOCALES } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionary";
import { ROUTES, href, type RouteKey } from "@/i18n/routes";

const APP = join(process.cwd(), "src", "app");

/** Static page URLs found on disk. Route groups "(x)" don't appear in URLs; dynamic segments are skipped. */
function pageRoutes(dir = APP): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    if (name === "api" || name.startsWith("[") || name.startsWith("_")) continue;
    if (existsSync(join(full, "page.tsx"))) {
      const url = relative(APP, full)
        .split(sep)
        .filter((seg) => !seg.startsWith("("))
        .join("/");
      out.push(`/${url}`.replace(/\/$/, "") || "/");
    }
    out.push(...pageRoutes(full));
  }
  return out;
}

describe("routes", () => {
  const onDisk = new Set(pageRoutes());
  const mapped = Object.values(ROUTES)
    .flatMap((r): (string | null)[] => [r.en, r.es])
    .filter((p): p is string => p !== null);

  it("has a page for every path in the route map", () => {
    for (const p of mapped) expect(onDisk, `no page for ${p}`).toContain(p);
  });

  it("lists every page on disk in the route map", () => {
    for (const p of onDisk) expect(mapped, `unmapped page ${p}`).toContain(p);
  });

  it("puts every page in the sitemap with hreflang alternates", () => {
    const entries = sitemap();
    const urls = new Set(entries.map((e) => new URL(e.url).pathname));
    for (const p of onDisk) expect(urls, `sitemap missing ${p}`).toContain(p);
    const spanishHome = entries.find((e) => e.url.endsWith("/es"));
    expect(spanishHome?.alternates?.languages).toMatchObject({ "en-US": expect.any(String), "es-US": expect.any(String) });
  });

  it.each(LOCALES)("points every %s navigation link at a real page", (locale) => {
    const d = getDictionary(locale);
    const keys: RouteKey[] = [
      ...d.nav.primary.map((n) => n.key),
      ...d.nav.utility.map((n) => n.key),
      ...d.footer.forYouLinks.map((n) => n.key),
      ...d.footer.legal.map((n) => n.key),
      ...getContent(locale).pathways.map((p) => p.key),
    ];
    for (const key of keys) expect(onDisk, `broken ${locale} link ${key}`).toContain(href(locale, key));
  });

  it("uses the organisation's real domain by default", () => {
    expect(site.url).toMatch(/mystarsacademy\.org/);
  });
});
