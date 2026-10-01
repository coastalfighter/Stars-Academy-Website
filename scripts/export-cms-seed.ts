import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildSeed, toNdjson } from "../src/cms/seed";

const out = resolve(process.cwd(), "studio/seed/content.ndjson");
const docs = buildSeed();
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, toNdjson(docs));
console.log(`Wrote ${docs.length} documents to ${out}`);
