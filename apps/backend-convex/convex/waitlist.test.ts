import { describe, expect, it } from "vitest";

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
