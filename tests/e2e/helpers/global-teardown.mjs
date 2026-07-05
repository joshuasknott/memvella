import { spawnSync } from "node:child_process";
import process from "node:process";

const desiredTestAuthToken =
  process.env.MEMVELLA_TEST_AUTH_TOKEN ?? "memvella-local-test-token";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const nextOrigin = new URL(baseURL).origin;
const defaultBetterAuthSecret = "memvella-local-test-secret";
const defaultAuthPepper = "memvella-local-test-pepper";

function mergeTrustedOrigins(baseOrigin) {
  const configuredOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set([baseOrigin, ...configuredOrigins])).join(",");
}

function runConvexEnv(args) {
  return spawnSync(
    "corepack",
    ["pnpm", "--dir", "apps/backend-convex", "exec", "convex", "env", ...args],
    {
      cwd: process.cwd(),
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    },
  );
}

function getConvexEnv(name) {
  const result = runConvexEnv(["get", name]);
  const value = (result.stdout ?? "").trim();

  if (!value || value.startsWith("✖")) {
    return null;
  }

  return value;
}

function removeConvexEnv(name) {
  runConvexEnv(["remove", name]);
}

function removeConvexEnvIfMatches(name, desiredValue) {
  if (getConvexEnv(name) === desiredValue) {
    removeConvexEnv(name);
  }
}

export default async function globalTeardown() {
  const isE2eTestMode = getConvexEnv("MEMVELLA_TEST_MODE") === "1";

  if (isE2eTestMode) {
    removeConvexEnv("MEMVELLA_TEST_MODE");
  }

  if (getConvexEnv("MEMVELLA_TEST_AUTH_TOKEN") === desiredTestAuthToken) {
    removeConvexEnv("MEMVELLA_TEST_AUTH_TOKEN");
  }

  if (!isE2eTestMode) {
    return;
  }

  removeConvexEnvIfMatches("BETTER_AUTH_URL", nextOrigin);
  removeConvexEnvIfMatches("NEXT_PUBLIC_SITE_URL", nextOrigin);
  removeConvexEnvIfMatches("SITE_URL", nextOrigin);
  removeConvexEnvIfMatches(
    "BETTER_AUTH_TRUSTED_ORIGINS",
    mergeTrustedOrigins(nextOrigin),
  );
  removeConvexEnvIfMatches("BETTER_AUTH_SECRET", defaultBetterAuthSecret);
  removeConvexEnvIfMatches("MEMVELLA_AUTH_PEPPER", defaultAuthPepper);
  removeConvexEnvIfMatches("NODE_ENV", "test");
}
