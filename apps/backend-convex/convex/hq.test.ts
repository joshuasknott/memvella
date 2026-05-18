import { convexTest } from "convex-test";
import { afterEach, describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import { redactEmailForHq, isAuthorizedHqReadToken } from "./hq";
import {
  sanitizeAppEventMessageCode,
  sanitizeAppEventRoute,
} from "./appEvents";
import schema from "./schema";

const originalReadToken = process.env.MEMVELLA_HQ_READ_TOKEN;
// convex-test expects Vitest's import.meta.glob module map at runtime.
// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

afterEach(() => {
  if (originalReadToken === undefined) {
    delete process.env.MEMVELLA_HQ_READ_TOKEN;
  } else {
    process.env.MEMVELLA_HQ_READ_TOKEN = originalReadToken;
  }
});

describe("HQ read token validation", () => {
  it("rejects missing and wrong tokens", () => {
    process.env.MEMVELLA_HQ_READ_TOKEN = "correct-token";

    expect(isAuthorizedHqReadToken(undefined)).toBe(false);
    expect(isAuthorizedHqReadToken("wrong-token")).toBe(false);
  });

  it("accepts the configured token only", () => {
    process.env.MEMVELLA_HQ_READ_TOKEN = "correct-token";

    expect(isAuthorizedHqReadToken("correct-token")).toBe(true);
  });

  it("rejects wrong tokens at the query boundary", async () => {
    process.env.MEMVELLA_HQ_READ_TOKEN = "correct-token";
    const t = convexTest(schema, modules);

    await expect(
      t.query(api.hq.getCompanyOverview, { token: "wrong-token" }),
    ).rejects.toThrow("HQ read access denied.");
  });
});

describe("HQ redaction helpers", () => {
  it("redacts waitlist email addresses", () => {
    expect(redactEmailForHq("Founder@example.com")).toBe("f***@example.com");
    expect(redactEmailForHq("not-an-email")).toBe("redacted-email");
  });

  it("sanitizes app event routes and message codes", () => {
    expect(sanitizeAppEventRoute("/waitlist")).toBe("/waitlist");
    expect(sanitizeAppEventRoute("/api?token=secret")).toBeNull();
    expect(sanitizeAppEventRoute("alice@example.com")).toBeNull();
    expect(sanitizeAppEventMessageCode("Waitlist Joined!")).toBe(
      "waitlist_joined_",
    );
  });
});
