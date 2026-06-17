import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

// convex-test expects Vitest's import.meta.glob module map at runtime.
// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

async function seedWorkspaceWithSeniorAndSupporters() {
  const t = convexTest(schema, modules);

  const ids = await t.run(async (ctx) => {
    const circleId = await ctx.db.insert("circles", {
      displayName: "David Workspace",
      timezone: "Europe/London",
      locale: "en-GB",
    });
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      circleId,
      displayName: "David",
      seniorMode: "assisted",
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });
    const organiserMembershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken: "organiser-token",
      authEmail: "organiser@memvella.test",
      displayName: "Sarah Workspace",
      role: "organiser",
      seniorProfileId,
      onboardingStep: undefined,
      lastSeenAt: Date.now(),
    });
    const memberMembershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken: "member-token",
      authEmail: "member@memvella.test",
      displayName: "Emma Supporter",
      role: "member",
      seniorProfileId,
      onboardingStep: undefined,
      lastSeenAt: Date.now(),
    });

    return {
      circleId,
      seniorProfileId,
      organiserMembershipId,
      memberMembershipId,
    };
  });

  return {
    t,
    ids,
    organiser: t.withIdentity({
      tokenIdentifier: "organiser-token",
      email: "organiser@memvella.test",
    }),
    member: t.withIdentity({
      tokenIdentifier: "member-token",
      email: "member@memvella.test",
    }),
  };
}

describe("People management", () => {
  it("lets Workspace owners create, update, read, and delete senior-grounding People", async () => {
    const { organiser, t } = await seedWorkspaceWithSeniorAndSupporters();

    const personId = await organiser.mutation(api.people.addPerson, {
      name: "  David  ",
      relationship: " Brother ",
      isLiving: true,
      aiContext: "  Lives nearby and visits on Sundays. ",
    });

    const created = await organiser.query(api.people.getPersonDetail, { personId });
    expect(created).toMatchObject({
      id: personId,
      name: "David",
      relationship: "Brother",
      isLiving: true,
      aiContext: "Lives nearby and visits on Sundays.",
      photoUrl: null,
    });

    await organiser.mutation(api.people.updatePerson, {
      personId,
      name: "David Cooper",
      relationship: "Older brother",
      isLiving: false,
      aiContext: "Mention gently that David has passed away.",
    });

    const updated = await organiser.query(api.people.getPersonDetail, { personId });
    expect(updated).toMatchObject({
      id: personId,
      name: "David Cooper",
      relationship: "Older brother",
      isLiving: false,
      aiContext: "Mention gently that David has passed away.",
    });

    await organiser.mutation(api.people.deletePerson, { personId });

    const afterDelete = await t.run(async (ctx) => {
      return await ctx.db.get(personId as Id<"people">);
    });
    expect(afterDelete).toBeNull();
  });

  it("allows members to read People but blocks organiser-only mutations", async () => {
    const { organiser, member } = await seedWorkspaceWithSeniorAndSupporters();

    const personId = await organiser.mutation(api.people.addPerson, {
      name: "Anna",
      relationship: "Friend",
      isLiving: true,
      aiContext: "Enjoys gardening with David.",
    });

    const people = await member.query(api.people.listPeople);
    expect(people).toHaveLength(1);
    expect(people[0]).toMatchObject({
      id: personId,
      name: "Anna",
      relationship: "Friend",
    });

    await expect(
      member.mutation(api.people.updatePerson, {
        personId,
        name: "Anna",
        relationship: "Friend",
        isLiving: true,
        aiContext: "Updated by member",
      }),
    ).rejects.toThrow("This account does not have access to that Workspace setting.");

    await expect(
      member.mutation(api.people.deletePerson, { personId }),
    ).rejects.toThrow("This account does not have access to that Workspace setting.");
  });
});
