import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

describe("signed-in Workspace bootstrap", () => {
  it("creates one assisted Workspace profile and remains idempotent", async () => {
    const t = convexTest(schema, modules);
    const organiser = t.withIdentity({
      tokenIdentifier: "organiser-token",
      email: "sarah@example.com",
      name: "Sarah",
    });

    const firstMembershipId = await organiser.mutation(
      api.profile.createOrganiserProfile,
      {
        organiserName: "Sarah",
        seniorDisplayName: "David",
      },
    );
    const secondMembershipId = await organiser.mutation(
      api.profile.createOrganiserProfile,
      {
        organiserName: "Sarah Updated",
        seniorDisplayName: "David",
      },
    );

    expect(secondMembershipId).toBe(firstMembershipId);
    const state = await t.run(async (ctx) => ({
      circles: await ctx.db.query("circles").take(10),
      memberships: await ctx.db.query("circleMemberships").take(10),
      seniors: await ctx.db.query("seniorProfiles").take(10),
    }));
    expect(state.circles).toHaveLength(1);
    expect(state.memberships).toHaveLength(1);
    expect(state.seniors).toHaveLength(1);
    expect(state.seniors[0]?.seniorMode).toBe("assisted");
    expect(state.memberships[0]?.displayName).toBe("Sarah Updated");
  });

  it("does not let a Supporter turn their membership into an owner bootstrap", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      const circleId = await ctx.db.insert("circles", { displayName: "David Workspace" });
      await ctx.db.insert("circleMemberships", {
        circleId,
        authIdentityToken: "member-token",
        authEmail: "member@example.com",
        displayName: "Emma",
        role: "member",
        seniorProfileId: null,
      });
    });
    const member = t.withIdentity({
      tokenIdentifier: "member-token",
      email: "member@example.com",
      name: "Emma",
    });

    await expect(
      member.mutation(api.profile.createOrganiserProfile, {
        organiserName: "Emma",
        seniorDisplayName: "David",
      }),
    ).rejects.toThrow("This account does not have access to that Workspace setting.");
  });
});
