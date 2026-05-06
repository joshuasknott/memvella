import { afterEach, describe, expect, it } from "vitest";
import { getPasskeyConfig } from "./passkey";

const env = process.env as Record<string, string | undefined>;
const originalNodeEnv = process.env.NODE_ENV;
const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
const originalBetterAuthUrl = process.env.BETTER_AUTH_URL;

afterEach(() => {
  env.NODE_ENV = originalNodeEnv;
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl;
  }

  if (originalBetterAuthUrl === undefined) {
    delete process.env.BETTER_AUTH_URL;
  } else {
    process.env.BETTER_AUTH_URL = originalBetterAuthUrl;
  }
});

describe("getPasskeyConfig", () => {
  it("prefers the browser origin header during non-production proxy testing", () => {
    env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_SITE_URL = "https://localhost:3000";

    const config = getPasskeyConfig(
      new Request("http://localhost:3000/api/independent/passkey/register/options", {
        headers: {
          origin: "https://memvella.me",
        },
      }),
    );

    expect(config.origin).toBe("https://memvella.me");
    expect(config.rpID).toBe("memvella.me");
  });

  it("uses the configured site URL in production", () => {
    env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "https://memvella.me";

    const config = getPasskeyConfig(
      new Request("http://localhost:3000/api/independent/passkey/register/options", {
        headers: {
          origin: "https://other-origin.example",
        },
      }),
    );

    expect(config.origin).toBe("https://memvella.me");
    expect(config.rpID).toBe("memvella.me");
  });

  it("fails closed in production when site URL env is missing", () => {
    env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.BETTER_AUTH_URL;

    expect(() =>
      getPasskeyConfig(
        new Request("http://localhost:3000/api/independent/passkey/register/options"),
      ),
    ).toThrow(
      "NEXT_PUBLIC_SITE_URL or BETTER_AUTH_URL must be set and valid in production.",
    );
  });

  it("fails closed in production when site URL is malformed", () => {
    env.NODE_ENV = "production";
    process.env.NEXT_PUBLIC_SITE_URL = "not-a-valid-url";

    expect(() =>
      getPasskeyConfig(
        new Request("http://localhost:3000/api/independent/passkey/register/options"),
      ),
    ).toThrow(
      "NEXT_PUBLIC_SITE_URL or BETTER_AUTH_URL must be set and valid in production.",
    );
  });
});
