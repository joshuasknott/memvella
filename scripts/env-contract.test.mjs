import assert from "node:assert/strict";
import { test } from "node:test";
import {
  expectedTargets,
  formatResults,
  parseConvexConfigEnv,
  parseEnvExample,
  parseMarkdownContract,
  validateContract,
} from "./env-contract.mjs";

const contractMarkdown = `
| Variable | Required | Scope | Used by | Notes |
| --- | --- | --- | --- | --- |
| \`NEXT_PUBLIC_SITE_URL\` | yes | client and server | Better Auth callbacks | Must match origin |
| \`BETTER_AUTH_URL\` | yes | server and Convex | Better Auth base URL | Usually same value |
| \`CONVEX_DEPLOYMENT\` | required | local dev and deployment tooling | Convex CLI | Present in core and backend examples |
| \`CONVEX_URL\` | required only for marketing | server | apps/marketing waitlist | Marketing-only variable |
| \`MEMVELLA_TEST_MODE\` | optional | server and Convex | guarded E2E-only test seams | Local test helpers |
`;

test("parseMarkdownContract reads the variable contract table", () => {
  const contract = parseMarkdownContract(contractMarkdown);

  assert.deepEqual(
    contract.map((record) => record.variable),
    [
      "NEXT_PUBLIC_SITE_URL",
      "BETTER_AUTH_URL",
      "CONVEX_DEPLOYMENT",
      "CONVEX_URL",
      "MEMVELLA_TEST_MODE",
    ],
  );
  assert.equal(contract[1].scope, "server and Convex");
});

test("parseEnvExample reads assignment keys and skips comments", () => {
  assert.deepEqual([...parseEnvExample("# Comment\nFOO=\nBAR=value\n\n")], ["FOO", "BAR"]);
});

test("parseConvexConfigEnv reads the defineApp env block", () => {
  const variables = parseConvexConfigEnv(`
    const app = defineApp({
      env: {
        FOO: v.optional(v.string()),
        BAR: v.optional(v.string()),
      },
    });
  `);

  assert.deepEqual([...variables], ["FOO", "BAR"]);
});

test("expectedTargets classifies app, Convex, and marketing variables", () => {
  const expected = expectedTargets(parseMarkdownContract(contractMarkdown));

  assert.equal(expected.core.has("NEXT_PUBLIC_SITE_URL"), true);
  assert.equal(expected.core.has("CONVEX_URL"), false);
  assert.equal(expected.backendExample.has("BETTER_AUTH_URL"), true);
  assert.equal(expected.convexConfig.has("CONVEX_DEPLOYMENT"), true);
  assert.deepEqual([...expected.marketing], ["CONVEX_URL"]);
});

test("validateContract reports missing and undocumented variables", () => {
  const contract = parseMarkdownContract(contractMarkdown);
  const results = validateContract({
    contract,
    actualByTarget: {
      core: new Set(["NEXT_PUBLIC_SITE_URL", "UNLISTED"]),
      backendExample: new Set(["BETTER_AUTH_URL", "CONVEX_DEPLOYMENT", "MEMVELLA_TEST_MODE"]),
      marketing: new Set([]),
      convexConfig: new Set(["BETTER_AUTH_URL", "CONVEX_DEPLOYMENT", "MEMVELLA_TEST_MODE", "NODE_ENV"]),
    },
  });

  assert.equal(results.some((result) => result.label === "apps/core/.env.example"), true);
  assert.equal(formatResults(results).includes("UNLISTED"), true);
  assert.equal(formatResults(results).includes("CONVEX_URL"), true);
  assert.equal(formatResults(results).includes("NODE_ENV"), false);
});
