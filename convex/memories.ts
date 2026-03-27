import { mutation } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// Auth helper — derives the stable caregiver identity from the JWT token.
// =============================================================================
async function requireCaregiver(ctx: { auth: { getUserIdentity: () => Promise<{ tokenIdentifier: string } | null> } }) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: A valid caregiver session is required.");
  }
  return identity.tokenIdentifier;
}

// =============================================================================
// CONVERSATIONAL GRAPH — Memory Mutations
// =============================================================================
// Memories are separated from the Truth Graph by design.
// The AI must treat these as subjective, emotional recollections — NOT
// as verifiable facts. Each variant saves a strict `mediaType` literal
// to enforce integrity at the database level.
// =============================================================================

// -----------------------------------------------------------------------------
// addMemoryText
// -----------------------------------------------------------------------------
// A written story, optionally with a photo attachment.
// mediaType = "text"
// -----------------------------------------------------------------------------
export const addMemoryText = mutation({
  args: {
    title: v.string(),
    date: v.string(),                         // free-text, e.g. "Summer 1987"
    story: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db.insert("memories", {
      caregiverId,
      title: args.title,
      date: args.date,
      story: args.story,
      mediaType: "text",
      storageId: args.photoStorageId,
      songLink: undefined,
    });
  },
});

// -----------------------------------------------------------------------------
// addMemoryAudio
// -----------------------------------------------------------------------------
// A song or audio file that holds emotional significance.
// Supports both a streaming link (Spotify/Apple Music) and a direct upload.
// mediaType = "audio"
// -----------------------------------------------------------------------------
export const addMemoryAudio = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    story: v.string(),                         // "why Mom loves this song / context"
    songLink: v.optional(v.string()),          // Spotify / Apple Music URL
    mediaStorageId: v.optional(v.id("_storage")), // fallback direct upload
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db.insert("memories", {
      caregiverId,
      title: args.title,
      date: args.date,
      story: args.story,
      mediaType: "audio",
      storageId: args.mediaStorageId,
      songLink: args.songLink,
    });
  },
});

// -----------------------------------------------------------------------------
// addMemoryVoice
// -----------------------------------------------------------------------------
// A dictation-captured memory — the caregiver speaks and the frontend
// transcribes it. Stored as a standalone text memory with a "voice" type
// so the UI can display a microphone indicator rather than a camera icon.
// mediaType = "voice"
// -----------------------------------------------------------------------------
export const addMemoryVoice = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    transcript: v.string(),                   // the captured dictation text
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db.insert("memories", {
      caregiverId,
      title: args.title,
      date: args.date,
      story: args.transcript,                 // transcript stored as the story
      mediaType: "voice",
      storageId: undefined,
      songLink: undefined,
    });
  },
});

// -----------------------------------------------------------------------------
// addMemoryMedia
// -----------------------------------------------------------------------------
// A photo or video uploaded from the camera roll.
// Requires a Convex storage ID and a short context string.
// mediaType = "media"
// -----------------------------------------------------------------------------
export const addMemoryMedia = mutation({
  args: {
    title: v.string(),
    date: v.string(),
    story: v.string(),                        // short context or caption
    mediaStorageId: v.id("_storage"),         // required — media MUST be uploaded first
  },
  handler: async (ctx, args) => {
    const caregiverId = await requireCaregiver(ctx);

    return await ctx.db.insert("memories", {
      caregiverId,
      title: args.title,
      date: args.date,
      story: args.story,
      mediaType: "media",
      storageId: args.mediaStorageId,
      songLink: undefined,
    });
  },
});
