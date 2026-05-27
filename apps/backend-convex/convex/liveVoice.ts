import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { buildTranscriptExcerpt, scanVoiceSafety } from "./voiceSafety";

const LIVE_VOICE_MAX_HITS = 30;
const LIVE_VOICE_WINDOW_MS = 5 * 60 * 1000;
const LIVE_VOICE_BLOCK_MS = 10 * 60 * 1000;

type SeniorAiContext = {
  circleName: string;
  timeZone: string;
  locale: string;
  routines: Array<{
    title: string;
    time: string;
    frequency: string[];
    aiInstructions: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  people: Array<{
    name: string;
    relationship: string;
    isLiving: boolean;
    aiContext: string;
  }>;
  recentMemories: Array<{
    title: string;
    memoryDate: string | null;
    summary: string;
  }>;
  recentVoiceInteractions: Array<{
    transcript: string;
    assistantResponse: string | null;
    intentType:
      | "conversation"
      | "memory_draft"
      | "routine_draft"
      | "medical_rejection"
      | "unknown";
    distressDetected: boolean;
    createdAt: number;
  }>;
};

type ResolvedSeniorSession = {
  circleId: Id<"circles"> | null;
  seniorProfileId: Id<"seniorProfiles">;
  seniorName: string;
  seniorMode: "assisted" | "independent";
  sessionType: "assisted_device" | "independent_web";
  sessionId: Id<"seniorAccessSessions">;
  sourceCircleMembershipId: Id<"circleMemberships"> | null;
};

function buildAssistedSystemPrompt(
  seniorName: string,
  context: SeniorAiContext,
) {
  const sections = [
    `You are Memvella speaking with ${seniorName}.`,
    "Reply in 1 to 3 short, grounding sentences.",
    "Use only facts from this Circle context.",
    "If a detail is missing, say you do not know.",
    "Never give medical, dosage, diagnosis, or treatment advice.",
    "If the speaker seems confused or repeats themself, use recent voice history plus familiar routines, memories, and connections to gently reorient them.",
    "Keep the tone warm and direct.",
    `Circle: ${context.circleName}`,
  ];

  if (context.routines.length > 0) {
    sections.push(
      `Routines: ${context.routines
        .map((routine) => {
          const scheduleWindow =
            routine.startDate || routine.endDate
              ? `, active ${routine.startDate ?? "now"} to ${routine.endDate ?? "open"}`
              : "";
          const notes = routine.aiInstructions ? `, note: ${routine.aiInstructions}` : "";
          return `${routine.title} at ${routine.time} on ${routine.frequency.join(", ")}${notes}${scheduleWindow}`;
        })
        .join("; ")}`,
    );
  }

  if (context.people.length > 0) {
    sections.push(
      `People: ${context.people
        .map((person) =>
          person.isLiving
            ? `${person.name} is ${person.relationship}${person.aiContext ? `: ${person.aiContext}` : ""}`
            : `${person.name} was ${person.relationship}. Speak about past memories only${person.aiContext ? `: ${person.aiContext}` : ""}`,
        )
        .join("; ")}`,
    );
  }

  if (context.recentMemories.length > 0) {
    sections.push(
      `Recent memories: ${context.recentMemories
        .map(
          (memory) =>
            `${memory.title}${memory.memoryDate ? ` (${memory.memoryDate})` : ""}: ${memory.summary}`,
        )
        .join("; ")}`,
    );
  }

  if (context.recentVoiceInteractions.length > 0) {
    sections.push(
      `Recent voice history: ${context.recentVoiceInteractions
        .map((interaction) => {
          const assistantReply = interaction.assistantResponse
            ? ` | Memvella: ${interaction.assistantResponse}`
            : "";
          const distressLabel = interaction.distressDetected ? " [distress]" : "";
          return `Senior: ${interaction.transcript}${assistantReply}${distressLabel}`;
        })
        .join("; ")}`,
    );
  }

  return sections.join("\n");
}

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
    channel: v.optional(
      v.union(
        v.literal("assisted_voice_loop"),
        v.literal("independent_voice_loop"),
      ),
    ),
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
