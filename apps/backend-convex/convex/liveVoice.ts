import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { buildTranscriptExcerpt, scanVoiceSafety } from "./voiceSafety";
import {
  type SeniorAiContext,
  type ResolvedSeniorSession,
  buildAssistedSystemPrompt,
} from "./voiceShared";

const LIVE_VOICE_MAX_HITS = 30;
const LIVE_VOICE_WINDOW_MS = 5 * 60 * 1000;
const LIVE_VOICE_BLOCK_MS = 10 * 60 * 1000;

export const getAssistedLiveBootstrap = query({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const session: ResolvedSeniorSession = await ctx.runQuery(
      internal.seniorAccess.resolveSeniorSession,
      {
        sessionToken: args.sessionToken,
        deviceFingerprint: args.deviceFingerprint,
        expectedSessionType: "assisted_device",
      },
    );

    const context = (await ctx.runQuery(internal.voiceHelpers.gatherSeniorContext, {
      seniorProfileId: session.seniorProfileId,
      recentInteractionLimit: 5,
    })) as SeniorAiContext;

    return {
      circleId: session.circleId,
      seniorProfileId: session.seniorProfileId,
      seniorName: session.seniorName,
      sessionType: session.sessionType,
      systemInstruction: buildAssistedSystemPrompt(session.seniorName, context),
      locale: context.locale,
      timeZone: context.timeZone,
    };
  },
});

export const logAssistedLiveTurn = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    transcript: v.string(),
    assistantResponse: v.string(),
    channel: v.optional(v.literal("assisted_voice_loop")),
  },
  handler: async (ctx, args) => {
    const transcript = args.transcript.trim();
    const assistantResponse = args.assistantResponse.trim();
    if (!transcript || !assistantResponse) {
      return null;
    }

    const session: ResolvedSeniorSession = await ctx.runQuery(
      internal.seniorAccess.resolveSeniorSession,
      {
        sessionToken: args.sessionToken,
        deviceFingerprint: args.deviceFingerprint,
        expectedSessionType: "assisted_device",
      },
    );

    const rateLimit = await ctx.runMutation(internal.rateLimits.consumeRateLimit, {
      scopeKey: `senior-session:${session.sessionId}`,
      actionKey: "logAssistedLiveTurn",
      maxHits: LIVE_VOICE_MAX_HITS,
      windowMs: LIVE_VOICE_WINDOW_MS,
      blockDurationMs: LIVE_VOICE_BLOCK_MS,
    });

    if (!rateLimit.allowed) {
      return null;
    }

    const safety = scanVoiceSafety(transcript);

    const interactionId: Id<"voiceInteractions"> = await ctx.runMutation(
      internal.voiceHelpers.saveVoiceInteraction,
      {
        circleId: session.circleId,
        seniorProfileId: session.seniorProfileId,
        sessionType: session.sessionType,
        channel: args.channel ?? "assisted_voice_loop",
        transcript: buildTranscriptExcerpt(transcript, 500),
        assistantResponse,
        medicalRejected: false,
        medicalMarkers: safety.medicalMarkers,
        distressDetected: safety.distressDetected,
        distressMarkers: safety.distressMarkers,
        intentType: "conversation",
        draftTitle: null,
        draftDescription: null,
        draftDate: null,
        draftTimeLabel: null,
        draftTimeMinutes: null,
        draftDaysOfWeek: [],
        draftConfirmationStatus: "not_applicable",
      },
    );

    return interactionId;
  },
});
