import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";

// convex-test expects Vitest's import.meta.glob module map at runtime.
// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

async function seedWorkspace(args: {
  circleName: string;
  seniorName: string;
  organiserToken: string;
  memberToken?: string;
}) {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const circleId = await ctx.db.insert("circles", {
      displayName: args.circleName,
      timezone: "Europe/London",
      locale: "en-GB",
    });
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      circleId,
      displayName: args.seniorName,
      seniorMode: "assisted",
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });
    const organiserMembershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken: args.organiserToken,
      authEmail: `${args.organiserToken}@memvella.test`,
      displayName: "Workspace Owner",
      role: "organiser",
      seniorProfileId,
      onboardingStep: undefined,
      lastSeenAt: Date.now(),
    });
    const memberMembershipId = args.memberToken
      ? await ctx.db.insert("circleMemberships", {
          circleId,
          authIdentityToken: args.memberToken,
          authEmail: `${args.memberToken}@memvella.test`,
          displayName: "Supporter",
          role: "member",
          seniorProfileId,
          onboardingStep: undefined,
          lastSeenAt: Date.now(),
        })
      : null;

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
    organiser: t.withIdentity({ tokenIdentifier: args.organiserToken }),
    member: args.memberToken
      ? t.withIdentity({ tokenIdentifier: args.memberToken })
      : null,
  };
}

describe("memory CRUD authorization", () => {
  it("allows Workspace owners and Supporters to contribute memories", async () => {
    const { organiser, member, t, ids } = await seedWorkspace({
      circleName: "David Workspace",
      seniorName: "David",
      organiserToken: "owner-token",
      memberToken: "supporter-token",
    });

    const ownerMemoryId = await organiser.mutation(api.memories.addMemoryText, {
      title: "First garden",
      story: "David planted rosemary by the kitchen window.",
    });
    const supporterMemoryId = await member!.mutation(api.memories.addMemoryVoice, {
      title: "Sunday tea",
      transcript: "We had tea after the football match.",
    });

    const stored = await t.run(async (ctx) => ({
      ownerMemory: await ctx.db.get(ownerMemoryId as Id<"memoryRecords">),
      supporterMemory: await ctx.db.get(supporterMemoryId as Id<"memoryRecords">),
    }));

    expect(stored.ownerMemory).toMatchObject({
      seniorProfileId: ids.seniorProfileId,
      createdByCircleMembershipId: ids.organiserMembershipId,
    });
    expect(stored.supporterMemory).toMatchObject({
      seniorProfileId: ids.seniorProfileId,
      createdByCircleMembershipId: ids.memberMembershipId,
    });
  });

  it("denies cross-Workspace memory reads, updates, and deletes", async () => {
    const primary = await seedWorkspace({
      circleName: "Primary Workspace",
      seniorName: "David",
      organiserToken: "primary-owner-token",
      memberToken: "primary-member-token",
    });

    const memoryId = await primary.organiser.mutation(api.memories.addMemoryText, {
      title: "Only primary can see this",
      story: "Private Workspace memory.",
    });

    await primary.t.run(async (ctx) => {
      const otherCircleId = await ctx.db.insert("circles", {
        displayName: "Other Workspace",
        timezone: "Europe/London",
        locale: "en-GB",
      });
      const otherSeniorProfileId = await ctx.db.insert("seniorProfiles", {
        circleId: otherCircleId,
        displayName: "Amira",
        seniorMode: "assisted",
        accessStatus: "active",
        timezone: null,
        locale: null,
        lastSessionAt: undefined,
      });

      await ctx.db.insert("circleMemberships", {
        circleId: otherCircleId,
        authIdentityToken: "other-member-token",
        authEmail: "other-member-token@memvella.test",
        displayName: "Other Supporter",
        role: "member",
        seniorProfileId: otherSeniorProfileId,
        onboardingStep: undefined,
        lastSeenAt: Date.now(),
      });
    });

    const otherMember = primary.t.withIdentity({
      tokenIdentifier: "other-member-token",
    });
    await expect(
      otherMember.query(api.memories.getMemoryRecordDetail, { memoryRecordId: memoryId }),
    ).resolves.toBeNull();
    await expect(
      otherMember.mutation(api.memories.updateTextMemory, {
        memoryRecordId: memoryId,
        title: "Stolen edit",
        story: "Nope.",
      }),
    ).rejects.toThrow("This memory record does not belong to your Workspace.");
    await expect(
      otherMember.mutation(api.memories.deleteMemoryRecord, { memoryRecordId: memoryId }),
    ).rejects.toThrow("This memory record does not belong to your Workspace.");
  });
});
