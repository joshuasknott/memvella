"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, type ActionCtx } from "./_generated/server";
import {
  buildMedicalBoundaryReply,
  buildSpeechRetryReply,
  scanVoiceSafety,
} from "./voiceSafety";
import {
  type SeniorAiContext,
  type ResolvedSeniorSession,
  buildAssistedSystemPrompt,
} from "./voiceShared";

type AssistedVoiceActionResult = {
  reply: string;
  interactionId: Id<"voiceInteractions"> | null;
  medicalRejected: boolean;
  distressDetected: boolean;
};

const FAST_VOICE_MODEL = "gemini-2.5-flash-lite";

function formatRetryMessage(retryAfterMs: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `Please wait ${retryAfterSeconds} seconds before trying voice again.`;
}

async function enforceVoiceRateLimit(
  ctx: ActionCtx,
  session: ResolvedSeniorSession,
  actionKey: string,
) {
  const rateLimit = await ctx.runMutation(internal.rateLimits.consumeRateLimit, {
    scopeKey: `senior-session:${session.sessionId}`,
    actionKey,
    maxHits: 15,
    windowMs: 5 * 60 * 1000,
    blockDurationMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    throw new Error(formatRetryMessage(rateLimit.retryAfterMs));
  }
}

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Run: npx convex env set GEMINI_API_KEY <your-key>",
    );
  }

  return new GoogleGenAI({ apiKey });
}

export const handleAssistedVoiceTurn = action({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    transcript: v.string(),
  },
  handler: async (ctx, args): Promise<AssistedVoiceActionResult> => {
    const transcript = args.transcript.trim();
    if (!transcript) {
      return {
        reply: buildSpeechRetryReply(),
        interactionId: null,
        medicalRejected: false,
        distressDetected: false,
      };
    }

    const session: ResolvedSeniorSession = await ctx.runQuery(
      internal.seniorAccess.resolveSeniorSession,
      {
        sessionToken: args.sessionToken,
        deviceFingerprint: args.deviceFingerprint,
        expectedSessionType: "assisted_device",
      },
    );
    await enforceVoiceRateLimit(ctx, session, "handleAssistedVoiceTurn");
    const safety = scanVoiceSafety(transcript);

    let reply: string;
    if (safety.medicalRejected) {
      reply = buildMedicalBoundaryReply();
    } else {
      try {
        const context = (await ctx.runQuery(
          internal.voiceHelpers.gatherSeniorContext,
          {
            seniorProfileId: session.seniorProfileId,
            recentInteractionLimit: 5,
          },
        )) as SeniorAiContext;

        const aiResponse = await getAiClient().models.generateContent({
          model: FAST_VOICE_MODEL,
          contents: transcript,
          config: {
            systemInstruction: buildAssistedSystemPrompt(
              session.seniorName,
              context,
              safety.distressDetected,
            ),
            temperature: 0.3,
            maxOutputTokens: 96,
            thinkingConfig: {
              thinkingBudget: 0,
            },
          },
        });
        reply = aiResponse.text ?? buildSpeechRetryReply();
      } catch {
        reply = buildSpeechRetryReply();
      }
    }

    const interactionId: Id<"voiceInteractions"> = await ctx.runMutation(
      internal.voiceHelpers.saveVoiceInteraction,
      {
        circleId: session.circleId,
        seniorProfileId: session.seniorProfileId,
        sessionType: session.sessionType,
        channel: "assisted_voice_loop",
        transcript,
        assistantResponse: reply,
        medicalRejected: safety.medicalRejected,
        medicalMarkers: safety.medicalMarkers,
        distressDetected: safety.distressDetected,
        distressMarkers: safety.distressMarkers,
        intentType: safety.medicalRejected ? "medical_rejection" : "conversation",
        draftTitle: null,
        draftDescription: null,
        draftDate: null,
        draftTimeLabel: null,
        draftTimeMinutes: null,
        draftDaysOfWeek: [],
        draftConfirmationStatus: "not_applicable",
      },
    );

    return {
      reply,
      interactionId,
      medicalRejected: safety.medicalRejected,
      distressDetected: safety.distressDetected,
    };
  },
});
