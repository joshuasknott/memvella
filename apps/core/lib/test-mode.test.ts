import { afterEach, describe, expect, it, vi } from "vitest";

const env = process.env as Record<string, string | undefined>;

const originalNodeEnv = env.NODE_ENV;
const originalVercelEnv = env.VERCEL_ENV;
const originalTestMode = env.MEMVELLA_TEST_MODE;

async function loadTestMode() {
  vi.resetModules();
  return await import("./test-mode");
}

afterEach(() => {
  if (originalNodeEnv === undefined) {
    delete env.NODE_ENV;
  } else {
    env.NODE_ENV = originalNodeEnv;
  }

  if (originalVercelEnv === undefined) {
    delete env.VERCEL_ENV;
  } else {
    env.VERCEL_ENV = originalVercelEnv;
  }

  if (originalTestMode === undefined) {
    delete env.MEMVELLA_TEST_MODE;
  } else {
    env.MEMVELLA_TEST_MODE = originalTestMode;
  }
});

describe("Memvella test mode gate", () => {
  it("allows test mode in non-production runtimes", async () => {
    env.NODE_ENV = "test";
    env.MEMVELLA_TEST_MODE = "1";
    const testMode = await loadTestMode();

    expect(testMode.isMemvellaTestModeAvailable()).toBe(true);
    expect(() => testMode.ensureMemvellaTestModeEnabled()).not.toThrow();
  });

  it("blocks test mode in production runtimes", async () => {
    env.NODE_ENV = "production";
    env.MEMVELLA_TEST_MODE = "1";
    const testMode = await loadTestMode();

    expect(testMode.isMemvellaTestModeAvailable()).toBe(false);
    expect(() => testMode.ensureMemvellaTestModeEnabled()).toThrow(
      "Memvella test mode is not available in production.",
    );
  });
});
