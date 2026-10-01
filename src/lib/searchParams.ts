import { AUDIENCES, REASONS, type Audience, type Reason } from "@/lib/validation/inquiry";

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const pick = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : undefined;

/** Reads `?audience=&reason=` form presets from untrusted query params (allow-listed). */
export async function formPresets(searchParams: SearchParams): Promise<{ audience?: Audience; reason?: Reason }> {
  const params = await searchParams;
  return { audience: pick(params.audience, AUDIENCES), reason: pick(params.reason, REASONS) };
}
