import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

type DbCtx = MutationCtx | QueryCtx;

async function resolvePreferredSeniorProfileId(
  ctx: DbCtx,
  familySpaceId: Id<"familySpaces">,
) {
  const assistedSenior = await ctx.db
    .query("seniorProfiles")
    .withIndex("by_familySpaceId_and_seniorMode", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("seniorMode", "assisted"),
    )
    .unique();
  if (assistedSenior) {
    return assistedSenior._id;
  }

  const independentSenior = await ctx.db
    .query("seniorProfiles")
    .withIndex("by_familySpaceId_and_seniorMode", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("seniorMode", "independent"),
    )
    .unique();

  return independentSenior?._id ?? null;
}

export async function ensurePeopleRowForFamilyMember(
  ctx: MutationCtx,
  legacyFamilyMemberId: Id<"familyMembers">,
) {
  const existing = await ctx.db
    .query("people")
    .withIndex("by_legacyFamilyMemberId", (query) =>
      query.eq("legacyFamilyMemberId", legacyFamilyMemberId),
    )
    .unique();
  if (existing) {
    return existing;
  }

  const legacyMember = await ctx.db.get(legacyFamilyMemberId);
  if (!legacyMember) {
    return null;
  }

  const seniorProfileId = await resolvePreferredSeniorProfileId(
    ctx,
    legacyMember.familySpaceId,
  );
  const now = Date.now();

  const personId = await ctx.db.insert("people", {
    familySpaceId: legacyMember.familySpaceId,
    seniorProfileId,
    legacyFamilyMemberId,
    name: legacyMember.name,
    relationship: legacyMember.relationship,
    isLiving: legacyMember.isLiving,
    aiContext: legacyMember.aiContext,
    photoStorageId: legacyMember.photoStorageId,
    createdByMembershipId: null,
    updatedByMembershipId: null,
    lastEditedAt: now,
  });

  return await ctx.db.get(personId);
}

export async function mirrorPersonToLegacyFamilyMember(
  ctx: MutationCtx,
  args: {
    familySpaceId: Id<"familySpaces">;
    name: string;
    relationship: string;
    isLiving: boolean;
    aiContext: string;
    photoStorageId: Id<"_storage"> | undefined;
  },
) {
  const legacyId = await ctx.db.insert("familyMembers", {
    familySpaceId: args.familySpaceId,
    name: args.name,
    relationship: args.relationship,
    isLiving: args.isLiving,
    aiContext: args.aiContext,
    photoStorageId: args.photoStorageId,
  });

  return legacyId;
}

export async function listPeopleForFamilySpace(
  ctx: DbCtx,
  familySpaceId: Id<"familySpaces">,
  limit: number,
) {
  const people = await ctx.db
    .query("people")
    .withIndex("by_familySpaceId", (query) => query.eq("familySpaceId", familySpaceId))
    .take(limit);

  if (people.length > 0) {
    return people;
  }

  if (!("auth" in ctx)) {
    return [];
  }

  const legacyMembers = await ctx.db
    .query("familyMembers")
    .withIndex("by_familySpaceId", (query) => query.eq("familySpaceId", familySpaceId))
    .take(limit);

  const mirrored = [];

  for (const legacyMember of legacyMembers) {
    const person = await ensurePeopleRowForFamilyMember(ctx as MutationCtx, legacyMember._id);
    if (person) {
      mirrored.push(person);
    }
  }

  return mirrored;
}
