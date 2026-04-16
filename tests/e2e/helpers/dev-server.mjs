import { spawn } from "node:child_process";
import process from "node:process";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const healthURL = `${baseURL}/api/test/health`;
const nextOrigin = new URL(baseURL).origin;

function mergeTrustedOrigins(baseOrigin) {
  const configuredOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set([baseOrigin, ...configuredOrigins])).join(",");
}

function createChildEnv() {
  return {
    ...process.env,
    MEMVELLA_TEST_MODE: "1",
    NEXT_PUBLIC_MEMVELLA_TEST_MODE: "1",
    NEXT_PUBLIC_SITE_URL: nextOrigin,
    BETTER_AUTH_URL: nextOrigin,
    BETTER_AUTH_TRUSTED_ORIGINS: mergeTrustedOrigins(nextOrigin),
  };
}

function spawnProcess(command, args) {
  return spawn(command, args, {
    cwd: process.cwd(),
    env: createChildEnv(),
    shell: true,
    stdio: "inherit",
  });
}

async function waitForHealth(url, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, {
        redirect: "manual",
      });

      if (response.ok) {
        return;
      }
    } catch {
      // Keep polling until the server is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

const childProcesses = [
  spawnProcess("pnpm", ["convex:dev"]),
  spawnProcess("pnpm", [
    "--dir",
    "apps/core",
    "exec",
    "next",
    "dev",
    "--hostname",
    "127.0.0.1",
    "--port",
    "3000",
  ]),
];

let isCleaningUp = false;

function cleanupAndExit(code) {
  if (isCleaningUp) {
    return;
  }

  isCleaningUp = true;
  for (const child of childProcesses) {
    if (!child.killed) {
      child.kill();
    }
  }

  process.exit(code);
}

for (const child of childProcesses) {
  child.on("exit", (code) => {
    if (isCleaningUp) {
      return;
    }

    cleanupAndExit(code ?? 0);
  });
}

process.on("SIGINT", () => cleanupAndExit(130));
process.on("SIGTERM", () => cleanupAndExit(143));

try {
  await waitForHealth(healthURL, 180_000);
} catch (error) {
  console.error(error);
  cleanupAndExit(1);
}

await new Promise(() => undefined);
