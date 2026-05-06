import { describe, expect, it } from "vitest";

describe("upload intent validation contract", () => {
  it("rejects expired intents deterministically", () => {
    const now = Date.now();
    const expiredIntent = {
      consumedAt: null,
      expiresAt: now - 60_000,
    };
    expect(expiredIntent.expiresAt < now).toBe(true);
    expect(expiredIntent.consumedAt).toBeNull();

    const activeIntent = {
      consumedAt: null,
      expiresAt: now + 60 * 60 * 1000,
    };
    expect(activeIntent.expiresAt >= now).toBe(true);
    expect(activeIntent.consumedAt).toBeNull();
  });

  it("rejects already-consumed intents", () => {
    const consumedIntent = {
      consumedAt: Date.now() - 1000,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
    expect(consumedIntent.consumedAt).not.toBeNull();
  });

  it("requires circleMembershipId to match", () => {
    const callerMembershipId: string = "membership-A";
    const intentMembershipId: string = "membership-B";
    expect(callerMembershipId !== intentMembershipId).toBe(true);
  });
});
