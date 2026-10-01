import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const config = [
  ...nextVitals,
  ...nextTs,
  {
    ignores: [
      ".next/**",
      ".next-cms/**",
      ".lighthouseci/**",
      "playwright-report/**",
      "test-results/**",
      "node_modules/**",
      "coverage/**",
      "next-env.d.ts",
      "studio/**",
    ],
  },
];

export default config;
