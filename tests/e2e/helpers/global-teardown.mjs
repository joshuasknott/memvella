import { spawnSync } from "node:child_process";
import process from "node:process";

const desiredTestAuthToken =
  process.env.MEMVELLA_TEST_AUTH_TOKEN ?? "memvella-local-test-token";

function runConvexEnv(args) {
  return spawnSync(
    "pnpm",
    ["--dir", "apps/backend-convex", "exec", "convex", "env", ...args],
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

export default async function globalTeardown() {
  if (getConvexEnv("MEMVELLA_TEST_MODE") === "1") {
    removeConvexEnv("MEMVELLA_TEST_MODE");
  }

  if (getConvexEnv("MEMVELLA_TEST_AUTH_TOKEN") === desiredTestAuthToken) {
    removeConvexEnv("MEMVELLA_TEST_AUTH_TOKEN");
  }
}
