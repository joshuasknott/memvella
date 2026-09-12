import { convexTest } from "convex-test";
import type { FunctionReturnType } from "convex/server";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { buildMemorySearchText, createMemoryRecord } from "./memoryHelpers";

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
    expect((await otherMember.query(api.memories.browseMemoryRecords, {
      search: "primary", paginationOpts: { cursor: null, numItems: 24 },
    })).page).toEqual([]);
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

describe("memory browsing and search", () => {
  it("finds words after the preview and updates the search index when a story changes", async () => {
    const { organiser } = await seedWorkspace({ circleName: "Search", seniorName: "David", organiserToken: "search-owner" });
    const id = await organiser.mutation(api.memories.addMemoryText, {
      title: "A familiar afternoon", story: `${"A long and happy story. ".repeat(12)}We visited the orchard.`,
    });
    const search = (word: string) => organiser.query(api.memories.browseMemoryRecords, {
      search: word, paginationOpts: { cursor: null, numItems: 24 },
    });
    const result = await search("orchard");
    expect(result.page.map((item) => item.id)).toEqual([id]);
    expect(result.page[0]).not.toHaveProperty("story");
    expect(result.page[0].summary).not.toContain("orchard");
    await organiser.mutation(api.memories.updateTextMemory, { memoryRecordId: id, title: "A familiar afternoon", story: "We visited the harbour." });
    expect((await search("orchard")).page).toEqual([]);
    expect((await search("harbour")).page.map((item) => item.id)).toEqual([id]);
  });

  it("can browse and search memories older than the first hundred", async () => {
    const { t, organiser, ids } = await seedWorkspace({ circleName: "Library", seniorName: "David", organiserToken: "library-owner" });
    await t.run(async (ctx) => {
      for (let index = 0; index < 103; index++) {
        const id = await createMemoryRecord(ctx, {
          seniorProfileId: ids.seniorProfileId, circleMembershipId: ids.organiserMembershipId,
          recordType: "text", title: `Memory ${index}`, story: index === 0 ? "Our oldest seaside trip" : "A family memory",
        });
        await ctx.db.patch(id, { lastEditedAt: index });
      }
    });
    let cursor: string | null = null;
    const found: string[] = [];
    while (true) {
      const result: FunctionReturnType<typeof api.memories.browseMemoryRecords> = await organiser.query(api.memories.browseMemoryRecords, { paginationOpts: { cursor, numItems: 24 } });
      expect(result.page.length).toBeLessThanOrEqual(24);
      found.push(...result.page.map((item) => item.id));
      if (result.isDone) break;
      cursor = result.continueCursor;
    }
    expect(found).toHaveLength(103);
    expect(new Set(found).size).toBe(103);
    const oldest = await organiser.query(api.memories.browseMemoryRecords, { search: "seaside", paginationOpts: { cursor: null, numItems: 24 } });
    expect(oldest.page.map((item) => item.title)).toEqual(["Memory 0"]);
    expect(await organiser.query(api.memories.listMemoryRecords, { limit: 3 })).toHaveLength(3);
  });

  it("indexes dictated transcripts and bounds legacy search data without splitting Unicode", async () => {
    const { organiser } = await seedWorkspace({ circleName: "Voice", seniorName: "David", organiserToken: "voice-search-owner" });
    const id = await organiser.mutation(api.memories.addMemoryVoice, { title: "A remembered journey", transcript: "We took the overnight sleeper to Edinburgh." });
    const result = await organiser.query(api.memories.browseMemoryRecords, { search: "Edinburgh", paginationOpts: { cursor: null, numItems: 24 } });
    expect(result.page.map((item) => item.id)).toEqual([id]);
    const indexed = buildMemorySearchText({ title: "Garden", story: "🌻".repeat(200_000) });
    expect(indexed).not.toContain("�");
    expect(new TextEncoder().encode(indexed).length).toBeLessThan(100_000);
  });
});
