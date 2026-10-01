/**
 * PII scrubbing for anything that leaves the request: logs, alerts, reports.
 *
 * STARS serves children and families, so operational data must never carry
 * contact details or health information. Two layers:
 *  1. Fields whose *name* marks them as personal are replaced wholesale.
 *  2. Free text has e-mail addresses, phone numbers, long digit runs (IDs,
 *     Medicaid numbers, dates) and IP addresses masked.
 */

const SENSITIVE_KEYS = new Set([
  "name",
  "email",
  "phone",
  "message",
  "organization",
  "childage",
  "startdate",
  "authorization",
  "cookie",
  "set-cookie",
  "password",
  "secret",
  "token",
  "apikey",
  "ip",
  "x-forwarded-for",
  "x-real-ip",
]);

const PATTERNS: [RegExp, string][] = [
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, "[email]"],
  // IPv4 before phones/digits so it is labelled as an address.
  [/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, "[ip]"],
  [/\b(?:[0-9a-f]{1,4}:){4,7}[0-9a-f]{1,4}\b/gi, "[ip]"],
  [/(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b/g, "[phone]"],
  [/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, "[date]"],
  [/\b\d{6,}\b/g, "[number]"],
];

const MAX_STRING = 1_000;
const MAX_DEPTH = 5;
const MAX_KEYS = 40;

export function redactText(text: string): string {
  let out = text.length > MAX_STRING ? `${text.slice(0, MAX_STRING)}…` : text;
  for (const [pattern, label] of PATTERNS) out = out.replace(pattern, label);
  return out;
}

/** Deep-copies a value with sensitive fields and patterns removed. Never throws. */
export function redact(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactText(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Error) {
    return { name: value.name, message: redactText(value.message), ...(hasDigest(value) ? { digest: value.digest } : {}) };
  }
  if (depth >= MAX_DEPTH) return "[truncated]";
  if (Array.isArray(value)) return value.slice(0, MAX_KEYS).map((v) => redact(v, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value as Record<string, unknown>).slice(0, MAX_KEYS)) {
      out[key] = SENSITIVE_KEYS.has(key.toLowerCase()) ? "[redacted]" : redact(v, depth + 1);
    }
    return out;
  }
  return `[${typeof value}]`;
}

function hasDigest(e: Error): e is Error & { digest: string } {
  return typeof (e as { digest?: unknown }).digest === "string";
}

/**
 * Reduces a URL to origin + path. Query strings and fragments are dropped:
 * they can carry form values, tokens or tracking IDs.
 */
export function safeUrl(raw: unknown): string | undefined {
  if (typeof raw !== "string" || raw.length === 0) return undefined;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(raw)) return redactText(raw.split(/[?#]/)[0] ?? "").slice(0, 300);
  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") return redactText(`${url.origin}${url.pathname}`).slice(0, 300);
    return url.protocol.replace(/:$/, "");
  } catch {
    return undefined;
  }
}
