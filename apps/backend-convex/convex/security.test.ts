import { afterEach, describe, expect, it } from "vitest";
import {
  hashCircleInviteCode,
  isAllowedPushEndpoint,
  sanitizeExternalUrl,
} from "./security";

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

    const hashed = await hashCircleInviteCode("123456");
    expect(hashed.length).toBeGreaterThan(20);
  });

  it("fails closed in production when secrets are missing", async () => {
    env.NODE_ENV = "production";
    delete process.env.CONVEX_DEPLOYMENT;
    delete process.env.MEMVELLA_AUTH_PEPPER;
    delete process.env.BETTER_AUTH_SECRET;

    await expect(hashCircleInviteCode("123456")).rejects.toThrow(
      "Missing required crypto secret. Set MEMVELLA_AUTH_PEPPER or BETTER_AUTH_SECRET.",
    );
  });

  it("fails closed when Convex deployment is production", async () => {
    env.NODE_ENV = "development";
    process.env.CONVEX_DEPLOYMENT = "prod:memvella";
    delete process.env.MEMVELLA_AUTH_PEPPER;
    delete process.env.BETTER_AUTH_SECRET;

    await expect(hashCircleInviteCode("123456")).rejects.toThrow(
      "Missing required crypto secret. Set MEMVELLA_AUTH_PEPPER or BETTER_AUTH_SECRET.",
    );
  });
});

describe("sanitizeExternalUrl", () => {
  it("accepts valid HTTPS URLs", () => {
    expect(sanitizeExternalUrl("https://open.spotify.com/track/123")).toBe(
      "https://open.spotify.com/track/123",
    );
    expect(sanitizeExternalUrl("https://music.apple.com/album/456?i=789")).toBe(
      "https://music.apple.com/album/456?i=789",
    );
  });

  it("returns null for empty, null, or undefined input", () => {
    expect(sanitizeExternalUrl("")).toBeNull();
    expect(sanitizeExternalUrl(null)).toBeNull();
    expect(sanitizeExternalUrl(undefined)).toBeNull();
    expect(sanitizeExternalUrl("   ")).toBeNull();
  });

  it("rejects javascript:, data:, blob:, file: schemes", () => {
    expect(sanitizeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(sanitizeExternalUrl("data:text/html,<h1>hi</h1>")).toBeNull();
    expect(sanitizeExternalUrl("blob:https://example.com/abc")).toBeNull();
    expect(sanitizeExternalUrl("file:///etc/passwd")).toBeNull();
  });

  it("rejects http: URLs", () => {
    expect(sanitizeExternalUrl("http://example.com")).toBeNull();
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeExternalUrl("//evil.com")).toBeNull();
  });

  it("rejects malformed URLs", () => {
    expect(sanitizeExternalUrl("not-a-url")).toBeNull();
    expect(sanitizeExternalUrl("https://")).toBeNull();
  });

  it("rejects private/internal hostnames", () => {
    expect(sanitizeExternalUrl("https://localhost/path")).toBeNull();
    expect(sanitizeExternalUrl("https://127.0.0.1/path")).toBeNull();
    expect(sanitizeExternalUrl("https://10.0.0.1/path")).toBeNull();
    expect(sanitizeExternalUrl("https://172.16.0.1/path")).toBeNull();
    expect(sanitizeExternalUrl("https://192.168.1.1/path")).toBeNull();
    expect(sanitizeExternalUrl("https://169.254.1.1/path")).toBeNull();
    expect(sanitizeExternalUrl("https://0.0.0.0/path")).toBeNull();
  });

  it("rejects URLs with credentials", () => {
    expect(sanitizeExternalUrl("https://user:pass@example.com")).toBeNull();
  });

  it("rejects URLs with whitespace obfuscation", () => {
    expect(sanitizeExternalUrl("  https://example.com  ")).toBe(
      "https://example.com/",
    );
  });
});

describe("isAllowedPushEndpoint", () => {
  it("accepts valid HTTPS push endpoints", () => {
    expect(
      isAllowedPushEndpoint(
        "https://fcm.googleapis.com/fcm/send/abc123",
      ),
    ).toBe(true);
    expect(
      isAllowedPushEndpoint("https://updates.push.services.mozilla.com/wpush/v2/xyz"),
    ).toBe(true);
  });

  it("rejects non-HTTPS endpoints", () => {
    expect(isAllowedPushEndpoint("http://example.com/push")).toBe(false);
    expect(isAllowedPushEndpoint("data:text/html,hello")).toBe(false);
  });

  it("rejects private/internal endpoints", () => {
    expect(isAllowedPushEndpoint("https://localhost/push")).toBe(false);
    expect(isAllowedPushEndpoint("https://127.0.0.1/push")).toBe(false);
    expect(isAllowedPushEndpoint("https://10.0.0.1/push")).toBe(false);
    expect(isAllowedPushEndpoint("https://192.168.1.1/push")).toBe(false);
  });

  it("rejects malformed endpoints", () => {
    expect(isAllowedPushEndpoint("")).toBe(false);
    expect(isAllowedPushEndpoint("not-a-url")).toBe(false);
  });

  it("rejects endpoints with credentials", () => {
    expect(isAllowedPushEndpoint("https://user:pass@example.com/push")).toBe(
      false,
    );
  });
});
