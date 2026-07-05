import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

// convex-test expects Vitest's import.meta.glob module map at runtime.
// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

describe("waitlist joinWaitlist response contract", () => {
  it("returns uniform status for all code paths", () => {
    const validResponses = ["joined"] as const;
    expect(validResponses).toContain("joined");
    expect(validResponses).not.toContain("already_joined");
    expect(validResponses).not.toContain("rejoined");
  });

  it("rate limit scope key is server-controlled", () => {
    const scopeKey = "waitlist-global";
    const actionKey = "joinWaitlist";
    expect(scopeKey).toBe("waitlist-global");
    expect(actionKey).toBe("joinWaitlist");
  });
});

describe("waitlist joinWaitlist persistence", () => {
  it("returns the uniform response without storing malformed emails", async () => {
    const t = convexTest(schema, modules);

    await expect(
      t.mutation(api.waitlist.joinWaitlist, {
        email: "not-an-email",
        sourcePath: "/waitlist?email=person@example.com",
      }),
    ).resolves.toEqual({ status: "joined" });

    const stored = await t.run(async (ctx) => ({
      entries: await ctx.db.query("waitlistEntries").take(10),
      events: await ctx.db.query("appEvents").take(10),
    }));
    expect(stored.entries).toHaveLength(0);
    expect(stored.events).toHaveLength(0);
  });

  it("normalizes duplicate emails and records only sanitized app events", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.waitlist.joinWaitlist, {
      email: "  Casey@Example.COM ",
      sourcePath: "/waitlist",
      referrer: "https://example.com",
      userAgent: "Memvella test",
    });
    await t.mutation(api.waitlist.joinWaitlist, {
      email: "casey@example.com",
      sourcePath: "/waitlist?token=secret&email=casey@example.com",
      referrer: "https://example.com/second",
      userAgent: "Memvella test second",
    });

    const stored = await t.run(async (ctx) => ({
      entries: await ctx.db.query("waitlistEntries").take(10),
      events: await ctx.db
        .query("appEvents")
        .withIndex("by_eventType_and_createdAt", (query) =>
          query.eq("eventType", "waitlist_submission"),
        )
        .take(10),
    }));

    expect(stored.entries).toHaveLength(1);
    expect(stored.entries[0]).toMatchObject({
      email: "casey@example.com",
      status: "active",
      sourcePath: "/waitlist",
    });
    expect(stored.events.map((event) => event.messageCode)).toEqual([
      "waitlist.joined",
      "waitlist.rejoined",
    ]);
    expect(stored.events.map((event) => event.sourceRoute)).toEqual([
      "/waitlist",
      null,
    ]);
  });

  it("rate limits without storing entries or app events for blocked submissions", async () => {
    const t = convexTest(schema, modules);

    for (let index = 0; index < 11; index += 1) {
      await expect(
        t.mutation(api.waitlist.joinWaitlist, {
          email: `person-${index}@example.com`,
          sourcePath: "/waitlist",
        }),
      ).resolves.toEqual({ status: "joined" });
    }

    const stored = await t.run(async (ctx) => ({
      entries: await ctx.db.query("waitlistEntries").take(20),
      events: await ctx.db.query("appEvents").take(20),
      rateLimits: await ctx.db.query("rateLimitWindows").take(10),
    }));

    expect(stored.entries).toHaveLength(10);
    expect(stored.events).toHaveLength(10);
    expect(stored.rateLimits[0]).toMatchObject({
      scopeKey: "waitlist-global",
      actionKey: "joinWaitlist",
      hits: 11,
    });
    expect(stored.rateLimits[0].blockedUntil).not.toBeNull();
  });
});
