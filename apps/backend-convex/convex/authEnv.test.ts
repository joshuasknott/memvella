import { describe, expect, it } from "vitest";
import {
  resolveBetterAuthSecret,
  resolveBetterAuthSiteUrl,
  resolveTrustedOriginsEnv,
} from "./authEnv";

describe("better auth environment resolution", () => {
  it("ignores blank app URL variables before falling back", () => {
    expect(
      resolveBetterAuthSiteUrl({
        BETTER_AUTH_URL: " ",
        SITE_URL: "",
        NEXT_PUBLIC_SITE_URL: "https://app.memvella.test",
      }),
    ).toBe("https://app.memvella.test");
  });

  it("prefers the explicit Better Auth URL when present", () => {
    expect(
      resolveBetterAuthSiteUrl({
        BETTER_AUTH_URL: "https://auth.memvella.test",
        NEXT_PUBLIC_SITE_URL: "https://app.memvella.test",
      }),
    ).toBe("https://auth.memvella.test");
  });

  it("requires a non-blank Better Auth secret", () => {
    expect(() => resolveBetterAuthSecret({ BETTER_AUTH_SECRET: "" })).toThrow(
      "BETTER_AUTH_SECRET",
    );
    expect(resolveBetterAuthSecret({ BETTER_AUTH_SECRET: "secret" })).toBe(
      "secret",
    );
  });

  it("normalizes blank trusted origins env to an empty list source", () => {
    expect(resolveTrustedOriginsEnv({ BETTER_AUTH_TRUSTED_ORIGINS: " " })).toBe(
      "",
    );
  });
});
