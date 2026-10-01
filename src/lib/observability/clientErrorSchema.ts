import { z } from "@/lib/validation/zod";

/**
 * Server-side validation for POST /api/client-error. Kept apart from the
 * browser sender (clientReport.ts) so Zod isn't shipped to every page.
 */
export const clientErrorSchema = z.object({
  kind: z.enum(["boundary", "unhandled", "rejection"]),
  message: z.string().max(500),
  digest: z
    .string()
    .regex(/^[\w-]{1,64}$/)
    .optional(),
  path: z.string().startsWith("/").max(300),
  locale: z.enum(["en", "es"]),
  source: z.string().max(300).optional(),
  line: z.number().int().nonnegative().max(10_000_000).optional(),
  column: z.number().int().nonnegative().max(10_000_000).optional(),
  stack: z.string().max(2_000).optional(),
});
