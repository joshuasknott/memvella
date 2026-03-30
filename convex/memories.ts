import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { requireFamilySpaceMembership } from "./familySpaceAuth";

async function requireSupporterFamilySpaceId(
  ctx: MutationCtx,
): Promise<Id<"familySpaces">> {
  const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
  return membership.familySpaceId;
}

export const addMemoryText = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    story: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const familySpaceId = await requireSupporterFamilySpaceId(ctx);

    return await ctx.db.insert("memories", {
      familySpaceId,
      title: args.title,
      date: args.date,
      story: args.story,
      mediaType: "text",
      storageId: args.photoStorageId,
      songLink: undefined,
    });
  },
});

export const addMemoryAudio = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    story: v.string(),
    songLink: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const familySpaceId = await requireSupporterFamilySpaceId(ctx);

    return await ctx.db.insert("memories", {
      familySpaceId,
      title: args.title,
      date: args.date,
      story: args.story,
      mediaType: "audio",
      storageId: args.mediaStorageId,
      songLink: args.songLink,
    });
  },
});

export const addMemoryVoice = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const familySpaceId = await requireSupporterFamilySpaceId(ctx);

    return await ctx.db.insert("memories", {
      familySpaceId,
      title: args.title,
      date: args.date,
      story: args.transcript,
      mediaType: "voice",
      storageId: undefined,
      songLink: undefined,
    });
  },
});

export const addMemoryMedia = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    story: v.string(),
    mediaStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const familySpaceId = await requireSupporterFamilySpaceId(ctx);

    return await ctx.db.insert("memories", {
      familySpaceId,
      title: args.title,
      date: args.date,
      story: args.story,
      mediaType: "media",
      storageId: args.mediaStorageId,
      songLink: undefined,
    });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireSupporterFamilySpaceId(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
