import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint config for library packages.
 *
 * Usage in eslint.config.mjs:
 *   import { library } from "@memvella/config-eslint/library";
 *   export default library();
 */
export function library({ rules = {}, ignores = [] } = {}) {
  return defineConfig([
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
      rules: {
        "@typescript-eslint/no-unused-vars": [
          "error",
          { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        ],
        ...rules,
      },
    },
    {
      ignores: ["node_modules/**", "dist/**", ...ignores],
    },
  ]);
}
