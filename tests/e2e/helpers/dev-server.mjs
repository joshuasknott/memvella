import { spawn, spawnSync } from "node:child_process";
import process from "node:process";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
const healthURL = `${baseURL}/api/test/health`;
const nextOrigin = new URL(baseURL).origin;
const convexUrl =
  process.env.MEMVELLA_E2E_CONVEX_URL ?? "http://127.0.0.1:3210";
const convexSiteUrl =
  process.env.MEMVELLA_E2E_CONVEX_SITE_URL ?? "http://127.0.0.1:3211";
const convexTestAuthToken =
  process.env.MEMVELLA_TEST_AUTH_TOKEN ?? "memvella-local-test-token";
const betterAuthSecret =
  process.env.BETTER_AUTH_SECRET ?? "memvella-local-test-secret";
const authPepper =
  process.env.MEMVELLA_AUTH_PEPPER ?? "memvella-local-test-pepper";
const requiredConvexFunctions = [
  "testSupport:healthcheck",
  "testSupport:resetAppData",
  "testSupport:createSeniorSessionFixture",
  "testAwareness:seedAwarenessReviewFixture",
];

let originalConvexTestEnv = null;

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
    CONVEX_DEPLOYMENT: "anonymous:anonymous-backend-convex",
    CONVEX_URL: convexUrl,
    MEMVELLA_TEST_MODE: "1",
    NEXT_PUBLIC_CONVEX_SITE_URL: convexSiteUrl,
    NEXT_PUBLIC_CONVEX_URL: convexUrl,
    NEXT_PUBLIC_MEMVELLA_TEST_MODE: "1",
    NEXT_PUBLIC_SITE_URL: nextOrigin,
    BETTER_AUTH_URL: nextOrigin,
    BETTER_AUTH_TRUSTED_ORIGINS: mergeTrustedOrigins(nextOrigin),
    BETTER_AUTH_SECRET: betterAuthSecret,
    MEMVELLA_AUTH_PEPPER: authPepper,
    NODE_ENV: "test",
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

function spawnPnpm(args) {
  return spawnProcess("corepack", ["pnpm", ...args]);
}

function runCommand(command, args, label, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      env: createChildEnv(),
      shell: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0 || options.allowFailure) {
        resolve({
          code,
          stdout,
          stderr,
        });
        return;
      }

      reject(new Error(`${label} failed with exit code ${code}: ${stderr}`));
    });
  });
}

function runCommandSync(command, args, label, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env: createChildEnv(),
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    encoding: "utf8",
  });

  if (result.status === 0 || options.allowFailure) {
    return {
      code: result.status ?? 0,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    };
  }

  throw new Error(
    `${label} failed with exit code ${result.status}: ${result.stderr}`,
  );
}

async function getConvexEnv(name) {
  const result = await runCommand(
    "corepack",
    ["pnpm", "--dir", "apps/backend-convex", "exec", "convex", "env", "get", name],
    `convex env get ${name}`,
    {
      allowFailure: true,
    },
  );

  if (result.code !== 0) {
    return {
      exists: false,
      value: "",
    };
  }

  return {
    exists: true,
    value: result.stdout.trimEnd(),
  };
}

async function assertConvexDeploymentConfigured() {
  const result = await runCommand(
    "corepack",
    [
      "pnpm",
      "--dir",
      "apps/backend-convex",
      "exec",
      "convex",
      "env",
      "get",
      "MEMVELLA_TEST_MODE",
    ],
    "convex env preflight",
    {
      allowFailure: true,
    },
  );

  if (result.code === 0) {
    return;
  }

  const output = `${result.stdout}\n${result.stderr}`;
  if (output.includes("No CONVEX_DEPLOYMENT")) {
    throw new Error(
      [
        "Playwright e2e requires a configured Convex dev deployment.",
        "Create apps/backend-convex/.env.local from apps/backend-convex/.env.example,",
        "set CONVEX_DEPLOYMENT, then run pnpm convex:dev once before pnpm test:e2e.",
      ].join(" "),
    );
  }

  throw new Error(`Convex e2e preflight failed: ${output.trim()}`);
}

async function setConvexEnv(name, value) {
  await runCommand(
    "corepack",
    ["pnpm", "--dir", "apps/backend-convex", "exec", "convex", "env", "set", name, value],
    `convex env set ${name}`,
  );
}

function setConvexEnvSync(name, value) {
  runCommandSync(
    "corepack",
    ["pnpm", "--dir", "apps/backend-convex", "exec", "convex", "env", "set", name, value],
    `convex env set ${name}`,
  );
}

function removeConvexEnvSync(name) {
  runCommandSync(
    "corepack",
    ["pnpm", "--dir", "apps/backend-convex", "exec", "convex", "env", "remove", name],
    `convex env remove ${name}`,
    {
      allowFailure: true,
    },
  );
}

async function configureConvexTestEnv() {
  const desiredEnv = {
    MEMVELLA_TEST_MODE: "1",
    MEMVELLA_TEST_AUTH_TOKEN: convexTestAuthToken,
    BETTER_AUTH_URL: nextOrigin,
    NEXT_PUBLIC_SITE_URL: nextOrigin,
    SITE_URL: nextOrigin,
    BETTER_AUTH_TRUSTED_ORIGINS: mergeTrustedOrigins(nextOrigin),
    BETTER_AUTH_SECRET: betterAuthSecret,
    MEMVELLA_AUTH_PEPPER: authPepper,
  };

  originalConvexTestEnv = {};
  for (const [name, desiredValue] of Object.entries(desiredEnv)) {
    const currentValue = await getConvexEnv(name);
    originalConvexTestEnv[name] = currentValue;

    if (!currentValue.exists || currentValue.value !== desiredValue) {
      await setConvexEnv(name, desiredValue);
    }
  }
}

function restoreConvexTestEnvSync() {
  if (!originalConvexTestEnv) {
    return;
  }

  for (const [name, originalValue] of Object.entries(originalConvexTestEnv)) {
    if (originalValue.exists) {
      setConvexEnvSync(name, originalValue.value);
    } else {
      removeConvexEnvSync(name);
    }
  }
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

async function waitForConvexFunctions(timeoutMs) {
  const startedAt = Date.now();
  let lastOutput = "";

  while (Date.now() - startedAt < timeoutMs) {
    const result = await runCommand(
      "corepack",
      [
        "pnpm",
        "--dir",
        "apps/backend-convex",
        "exec",
        "convex",
        "function-spec",
        "--deployment",
        "local",
      ],
      "convex function-spec",
      {
        allowFailure: true,
      },
    );
    lastOutput = `${result.stdout}\n${result.stderr}`.trim();

    if (
      result.code === 0 &&
      requiredConvexFunctions.every((functionName) =>
        lastOutput.includes(functionName),
      )
    ) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }

  throw new Error(
    `Timed out waiting for Convex test functions. Last output: ${lastOutput}`,
  );
}

await assertConvexDeploymentConfigured();
await configureConvexTestEnv();

const childProcesses = [
  spawnPnpm(["convex:dev"]),
  spawnPnpm([
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

  restoreConvexTestEnvSync();

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
  await waitForConvexFunctions(180_000);
  await waitForHealth(healthURL, 180_000);
} catch (error) {
  console.error(error);
  cleanupAndExit(1);
}

await new Promise(() => undefined);
