import { afterEach, describe, expect, it } from "vitest";
import { hashFamilyInviteCode } from "./security";

const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = process.env.NODE_ENV;
const originalConvexDeployment = process.env.CONVEX_DEPLOYMENT;
const originalPepper = process.env.MEMVELLA_AUTH_PEPPER;
const originalBetterAuthSecret = process.env.BETTER_AUTH_SECRET;

afterEach(() => {
  env.NODE_ENV = originalNodeEnv;

  if (originalConvexDeployment === undefined) {
    delete process.env.CONVEX_DEPLOYMENT;
  } else {
    process.env.CONVEX_DEPLOYMENT = originalConvexDeployment;
  }

  if (originalPepper === undefined) {
    delete process.env.MEMVELLA_AUTH_PEPPER;
  } else {
    process.env.MEMVELLA_AUTH_PEPPER = originalPepper;
  }

  if (originalBetterAuthSecret === undefined) {
    delete process.env.BETTER_AUTH_SECRET;
  } else {
    process.env.BETTER_AUTH_SECRET = originalBetterAuthSecret;
  }
});

describe("convex security secret behavior", () => {
  it("uses local fallback when secrets are missing in development", async () => {
    env.NODE_ENV = "development";
    delete process.env.CONVEX_DEPLOYMENT;
    delete process.env.MEMVELLA_AUTH_PEPPER;
    delete process.env.BETTER_AUTH_SECRET;

    const hashed = await hashFamilyInviteCode("123456");
    expect(hashed.length).toBeGreaterThan(20);
  });

  it("fails closed in production when secrets are missing", async () => {
    env.NODE_ENV = "production";
    delete process.env.CONVEX_DEPLOYMENT;
    delete process.env.MEMVELLA_AUTH_PEPPER;
    delete process.env.BETTER_AUTH_SECRET;

    await expect(hashFamilyInviteCode("123456")).rejects.toThrow(
      "Missing required crypto secret. Set MEMVELLA_AUTH_PEPPER or BETTER_AUTH_SECRET.",
    );
  });

  it("fails closed when Convex deployment is production", async () => {
    env.NODE_ENV = "development";
    process.env.CONVEX_DEPLOYMENT = "prod:memvella";
    delete process.env.MEMVELLA_AUTH_PEPPER;
    delete process.env.BETTER_AUTH_SECRET;

    await expect(hashFamilyInviteCode("123456")).rejects.toThrow(
      "Missing required crypto secret. Set MEMVELLA_AUTH_PEPPER or BETTER_AUTH_SECRET.",
    );
  });
});
