import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { LEGACY_REDIRECTS, LEGACY_UNCHANGED, nextRedirects } from "@/lib/launch/legacyRedirects";
import { isIndexable, verificationTags } from "@/lib/launch/indexing";
import { findPlaceholders } from "@/lib/launch/placeholders";
import { ROUTES, SERVICE_SLUGS } from "@/i18n/routes";

/** The old site's pages, from its sitemap (www.mystarsacademy.org/pages-sitemap.xml). */
const OLD_SITE = [
  "/",
  "/enroll-now",
  "/contact-us",
  "/apply-now",
  "/nursing",
  "/occupational-therapy",
  "/classrooms",
  "/schedule-a-tour",
  "/walk",
  "/what-we-do",
  "/general-8",
  "/speech-therapy",
  "/about-us",
  "/physical-therapy",
];

const NEW_PAGES = new Set<string>([
  ...Object.values(ROUTES).flatMap((r): string[] => (r.es ? [r.en, r.es] : [r.en])),
  ...Object.values(SERVICE_SLUGS).flatMap((s) => [`${ROUTES.services.en}/${s.en}`, `${ROUTES.services.es}/${s.es}`]),
]);

describe("legacy redirects", () => {
  it("cover every page of the old site", () => {
    for (const path of OLD_SITE) {
      const handled = LEGACY_UNCHANGED.includes(path) || LEGACY_REDIRECTS.some((r) => r.from === path);
      expect(handled, path).toBe(true);
    }
  });

  it("only point at real pages, in one hop, without shadowing new pages", () => {
    const froms = LEGACY_REDIRECTS.map((r) => r.from);
    expect(new Set(froms).size).toBe(froms.length);
    for (const r of LEGACY_REDIRECTS) {
      expect(NEW_PAGES.has(r.to), `${r.from} → ${r.to}`).toBe(true);
      expect(NEW_PAGES.has(r.from), `${r.from} would hide a new page`).toBe(false);
      expect(froms, `${r.to} is itself redirected (chain)`).not.toContain(r.to);
      expect(r.from).toMatch(/^\/[a-z0-9-]+(\/[a-z0-9-]+)*$/);
    }
    for (const path of LEGACY_UNCHANGED) expect(NEW_PAGES.has(path), path).toBe(true);
  });

  it("are permanent, so search engines move rankings to the new pages", () => {
    expect(nextRedirects().every((r) => r.permanent)).toBe(true);
  });
});

describe("indexing", () => {
  const env = (e: Record<string, string>) => e as unknown as NodeJS.ProcessEnv;

  it("indexes production and self-hosted builds only", () => {
    expect(isIndexable(env({ VERCEL_ENV: "production" }))).toBe(true);
    expect(isIndexable(env({}))).toBe(true);
    expect(isIndexable(env({ VERCEL_ENV: "preview" }))).toBe(false);
    expect(isIndexable(env({ VERCEL_ENV: "development" }))).toBe(false);
    // A temporary production deployment can be kept out of search.
    expect(isIndexable(env({ VERCEL_ENV: "production", SITE_INDEXABLE: "false" }))).toBe(false);
    expect(isIndexable(env({ SITE_INDEXABLE: "false" }))).toBe(false);
  });

  it("keeps preview deployments out of search via robots.txt", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.resetModules();
    const { default: robots } = await import("@/app/robots");
    expect(robots()).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
    vi.unstubAllEnvs();
    vi.resetModules();
    const { default: prodRobots } = await import("@/app/robots");
    expect(prodRobots().sitemap).toMatch(/\/sitemap\.xml$/);
  });

  it("adds search-console tags only when configured", () => {
    expect(verificationTags(env({}))).toBeUndefined();
    expect(verificationTags(env({ GOOGLE_SITE_VERIFICATION: "abc", BING_SITE_VERIFICATION: "def" }))).toEqual({ google: "abc", other: { "msvalidate.01": "def" } });
  });
});

describe("placeholder guard", () => {
  it("recognises filler without flagging Spanish 'todo'", () => {
    expect(findPlaceholders("Hours: [Client to confirm]")).toEqual(["unresolved client question"]);
    expect(findPlaceholders("TODO: write this")).toEqual(["TODO marker"]);
    expect(findPlaceholders("Call 870-555-0134 or visit example.org")).toEqual(["example domain", "fictional 555 phone number"]);
    expect(findPlaceholders("Apoyo durante todo el día")).toEqual([]);
  });

  it("finds none in the content shipped with the site", () => {
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        else if (/\.(ts|tsx)$/.test(name)) files.push(full);
      }
    };
    for (const dir of ["src/content", "src/i18n/dictionaries"]) walk(join(process.cwd(), dir));
    for (const file of files) {
      // Comments may mention the markers; only shipped strings matter.
      const code = readFileSync(file, "utf8")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/^\s*\/\/.*$/gm, "");
      const strings = code.match(/"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`/g) ?? [];
      expect(findPlaceholders(strings.join("\n")), file).toEqual([]);
    }
  });
});
