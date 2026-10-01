import type { z } from "zod";
import { cmsConfig, type CmsConfig } from "./config";

export type QueryOptions = {
  tags: string[];
  /** Seconds before a cached result is considered stale (webhooks usually refresh sooner). */
  revalidate: number;
};

type Deps = {
  config?: CmsConfig | null;
  fetchImpl?: typeof fetch;
  /** Whether Next.js draft mode is on for this request. */
  isDraft?: () => Promise<boolean>;
};

/** Draft mode is only readable inside a request; anywhere else it is simply off. */
async function draftEnabled(): Promise<boolean> {
  try {
    const { draftMode } = await import("next/headers");
    return (await draftMode()).isEnabled;
  } catch {
    return false;
  }
}

export function queryUrl(config: CmsConfig, query: string, params: Record<string, unknown>, draft: boolean): string {
  // Published reads go through the CDN; drafts must hit the live API with a token.
  const host = `${config.projectId}.${draft ? "api" : "apicdn"}.sanity.io`;
  const url = new URL(`https://${host}/v${config.apiVersion}/data/query/${config.dataset}`);
  url.searchParams.set("query", query);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(`$${key}`, JSON.stringify(value));
  url.searchParams.set("perspective", draft ? "drafts" : "published");
  url.searchParams.set("returnQuery", "false");
  return url.toString();
}

/**
 * Runs a GROQ query over Sanity's HTTP API and validates the result.
 *
 * Returns `null` — never throws — when the CMS is not configured, unreachable,
 * or returns data that doesn't match the schema. Callers then fall back to the
 * bundled content, so a CMS problem can never take the website down.
 */
export async function cmsQuery<S extends z.ZodType>(
  query: string,
  params: Record<string, unknown>,
  schema: S,
  { tags, revalidate }: QueryOptions,
  deps: Deps = {},
): Promise<z.output<S> | null> {
  const config = deps.config === undefined ? cmsConfig() : deps.config;
  if (!config) return null;

  const draft = (await (deps.isDraft ?? draftEnabled)()) && Boolean(config.readToken);
  const fetchImpl = deps.fetchImpl ?? fetch;

  try {
    const res = await fetchImpl(queryUrl(config, query, params, draft), {
      headers: draft ? { Authorization: `Bearer ${config.readToken}` } : {},
      signal: AbortSignal.timeout(5000),
      ...(draft ? { cache: "no-store" as const } : { cache: "force-cache" as const, next: { tags, revalidate } }),
    });
    if (!res.ok) {
      console.warn(`[cms] query failed with HTTP ${res.status}; using bundled content.`);
      return null;
    }
    const body = (await res.json()) as { result?: unknown };
    const parsed = schema.safeParse(body.result);
    if (!parsed.success) {
      console.warn("[cms] unexpected response shape; using bundled content.", parsed.error.issues.slice(0, 3));
      return null;
    }
    return parsed.data;
  } catch (error) {
    console.warn("[cms] query error; using bundled content.", error instanceof Error ? error.message : error);
    return null;
  }
}
