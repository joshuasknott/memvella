import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * Shared ESLint config for Next.js apps.
 *
 * Usage in eslint.config.mjs:
 *   import { nextApp } from "@memvella/config-eslint/next-app";
 *   export default nextApp({ ignores: ["convex/_generated/**"] });
 */
export function nextApp({ ignores = [] } = {}) {
  return defineConfig([
    ...nextVitals,
    ...nextTs,
    globalIgnores([
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      ...ignores,
    ]),
  ]);
}
