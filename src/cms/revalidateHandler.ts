import { CMS_TAGS, cmsConfig, isCmsDocumentType, type CmsConfig } from "./config";
import { SIGNATURE_HEADER, verifySignature } from "./webhook";

type RevalidateFn = (tag: string, profile: "max" | { expire: number }) => void;

type Deps = {
  config?: CmsConfig | null;
  revalidate: RevalidateFn;
  now?: () => number;
};

const MAX_BODY = 64 * 1024;
const json = (body: unknown, status: number) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * POST /api/revalidate — called by a Sanity webhook on publish/unpublish.
 * Configure the webhook projection as `{_type, _id}` and set the same secret
 * in Sanity and in SANITY_WEBHOOK_SECRET.
 */
export function createRevalidateHandler(deps: Deps) {
  return async function POST(request: Request): Promise<Response> {
    const config = deps.config === undefined ? cmsConfig() : deps.config;
    if (!config?.webhookSecret) return json({ ok: false, error: "Revalidation is not configured." }, 503);

    const body = await request.text();
    if (body.length > MAX_BODY) return json({ ok: false, error: "Payload too large." }, 413);

    const check = verifySignature(request.headers.get(SIGNATURE_HEADER), body, config.webhookSecret, (deps.now ?? Date.now)());
    if (!check.ok) return json({ ok: false, error: `Invalid signature (${check.reason}).` }, 401);

    let type: unknown;
    try {
      type = (JSON.parse(body) as { _type?: unknown })._type;
    } catch {
      return json({ ok: false, error: "Invalid JSON." }, 400);
    }
    if (!isCmsDocumentType(type)) return json({ ok: true, revalidated: [] }, 200);

    const tag = CMS_TAGS[type];
    // Closures and urgent notices must show on the very next request; other
    // content can be served once more while it refreshes in the background.
    deps.revalidate(tag, type === "announcement" ? { expire: 0 } : "max");
    return json({ ok: true, revalidated: [tag] }, 200);
  };
}
