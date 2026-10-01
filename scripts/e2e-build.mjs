/**
 * Builds the two sites the E2E suite runs against:
 *   .next      — the default build (no CMS: bundled content)
 *   .next-cms  — CMS enabled, with Sanity answered by e2e/fixtures/mock-sanity.cjs
 * Pass --only=site or --only=cms to build one.
 */
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
const mock = resolve("e2e/fixtures/mock-sanity.cjs");
const next = resolve("node_modules/next/dist/bin/next");

const builds = [
  { name: "site", env: {} },
  {
    name: "cms",
    env: {
      NEXT_DIST_DIR: ".next-cms",
      SANITY_PROJECT_ID: "e2etest01",
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --require ${mock}`.trim(),
    },
  },
].filter((b) => !only || b.name === only);

for (const build of builds) {
  console.log(`\n▶ Building ${build.name}…`);
  const result = spawnSync(process.execPath, [next, "build"], { stdio: "inherit", env: { ...process.env, ...build.env } });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
