import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const env = process.env as Record<string, string | undefined>;

const originalNodeEnv = env.NODE_ENV;
const originalTestMode = env.MEMVELLA_TEST_MODE;
const originalTestToken = env.MEMVELLA_TEST_AUTH_TOKEN;
const originalConvexUrl = env.NEXT_PUBLIC_CONVEX_URL;
const originalConvexSiteUrl = env.NEXT_PUBLIC_CONVEX_SITE_URL;
const originalBetterAuthUrl = env.BETTER_AUTH_URL;
const originalSiteUrl = env.NEXT_PUBLIC_SITE_URL;

function restoreEnvValue(key: string, value: string | undefined) {
  if (value === undefined) {
    delete env[key];
  } else {
    env[key] = value;
  }
}

async function loadRoute<TModule>(path: string) {
  vi.resetModules();
  return (await import(path)) as TModule;
}

type NextRequestInit = ConstructorParameters<typeof NextRequest>[1];

function testRequest(path: string, init?: NextRequestInit) {
  return new NextRequest(`https://memvella.test${path}`, init);
}

beforeEach(() => {
  env.NODE_ENV = "production";
  env.MEMVELLA_TEST_MODE = "1";
  env.MEMVELLA_TEST_AUTH_TOKEN = "configured-secret";
  env.NEXT_PUBLIC_CONVEX_URL = "https://example.convex.cloud";
  env.NEXT_PUBLIC_CONVEX_SITE_URL = "https://example.convex.site";
  env.BETTER_AUTH_URL = "https://memvella.test";
  env.NEXT_PUBLIC_SITE_URL = "https://memvella.test";
});

afterEach(() => {
  vi.restoreAllMocks();
  restoreEnvValue("NODE_ENV", originalNodeEnv);
  restoreEnvValue("MEMVELLA_TEST_MODE", originalTestMode);
  restoreEnvValue("MEMVELLA_TEST_AUTH_TOKEN", originalTestToken);
  restoreEnvValue("NEXT_PUBLIC_CONVEX_URL", originalConvexUrl);
  restoreEnvValue("NEXT_PUBLIC_CONVEX_SITE_URL", originalConvexSiteUrl);
  restoreEnvValue("BETTER_AUTH_URL", originalBetterAuthUrl);
  restoreEnvValue("NEXT_PUBLIC_SITE_URL", originalSiteUrl);
});

describe("production test API route guardrails", () => {
  it("hides the test health route in production", async () => {
    const route = await loadRoute<typeof import("./health/route")>(
      "./health/route",
    );

    const response = await route.GET();

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({
      ready: false,
      error: "Memvella test mode is disabled.",
    });
  });

  it("rejects the test reset route in production", async () => {
    const route = await loadRoute<typeof import("./reset/route")>(
      "./reset/route",
    );

    const response = await route.POST(
      testRequest("/api/test/reset", {
        method: "POST",
        headers: {
          "x-memvella-test-auth-token": "configured-secret",
        },
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      reset: false,
      error: "Memvella test reset failed.",
    });
  });

  it("rejects the test auth route in production", async () => {
    const route = await loadRoute<typeof import("./auth/route")>(
      "./auth/route",
    );

    const response = await route.POST(
      testRequest("/api/test/auth", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-memvella-test-auth-token": "configured-secret",
        },
        body: JSON.stringify({
          mode: "sign-in",
          email: "owner@example.com",
          password: "password",
        }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "Memvella test auth failed.",
    });
  });

  it("rejects the senior-session bootstrap route in production", async () => {
    const route =
      await loadRoute<
        typeof import("./bootstrap/senior-session/route")
      >("./bootstrap/senior-session/route");

    const response = await route.POST(
      testRequest("/api/test/bootstrap/senior-session", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-memvella-test-auth-token": "configured-secret",
        },
        body: JSON.stringify({ experience: "assisted" }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "Memvella test senior-session bootstrap failed.",
    });
  });

  it("rejects the member-invite redeem bootstrap route in production", async () => {
    const route =
      await loadRoute<
        typeof import("./bootstrap/member-invite/redeem/route")
      >("./bootstrap/member-invite/redeem/route");

    const response = await route.POST(
      testRequest("/api/test/bootstrap/member-invite/redeem", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-memvella-test-auth-token": "configured-secret",
        },
        body: JSON.stringify({ inviteCode: "123456" }),
      }),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "Memvella test member-invite redeem failed.",
    });
  });
});
