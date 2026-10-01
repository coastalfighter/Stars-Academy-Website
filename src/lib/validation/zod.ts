import { z } from "zod";

// Zod's JIT compiles parsers with `new Function`, which the site's CSP
// (no 'unsafe-eval') rightly blocks. Interpreted parsing is plenty fast for
// the small payloads validated here and keeps the browser console free of CSP
// violations. Every schema that can run in the browser imports `z` from here.
z.config({ jitless: true });

export { z };
