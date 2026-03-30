"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { buildTranscriptExcerpt } from "./voiceSafety";

type PendingInteraction = {
  interactionId: Id<"voiceInteractions">;
  familySpaceId: Id<"familySpaces">;
  seniorProfileId: Id<"seniorProfiles">;
  seniorName: string;
  sessionType: "assisted_device" | "independent_web";
  channel: "assisted_voice_loop" | "independent_voice_loop";
  transcript: string;
  assistantResponse: string | null;
  medicalRejected: boolean;
  distressDetected: boolean;
  intentType:
    | "conversation"
    | "memory_draft"
    | "routine_draft"
    | "medical_rejection"
    | "unknown";
  draftConfirmationStatus:
    | "not_applicable"
    | "pending"
    | "confirmed"
    | "rejected";
  createdAt: number;
};

type AiInsightCandidate = {
  seniorProfileId: Id<"seniorProfiles">;
  sourceVoiceInteractionId: Id<"voiceInteractions"> | null;
  insightType:
    | "memory_theme"
    | "routine_follow_up"
    | "connection_prompt"
    | "wellness_pattern";
  priority: "high" | "normal";
  title: string;
  summary: string;
  suggestedAction: string;
  evidenceTranscript: string | null;
};

const ALLOWED_INSIGHT_TYPES = new Set<AiInsightCandidate["insightType"]>([
  "memory_theme",
  "routine_follow_up",
  "connection_prompt",
  "wellness_pattern",
]);

const ALLOWED_PRIORITIES = new Set<AiInsightCandidate["priority"]>([
  "high",
  "normal",
]);

const SYSTEM_PROMPT = `You generate concise, actionable Supporter insights for Memvella.

Rules:
- Only use the supplied FamilySpace transcripts.
- Return a single valid JSON array and nothing else.
- Each item must contain: seniorProfileId, sourceVoiceInteractionId, insightType, priority, title, summary, suggestedAction, evidenceTranscript.
- Keep each title under 80 characters.
- Keep summaries specific and action-oriented.
- Never give medical advice.
- Distress and medical boundary alerts are already handled elsewhere. Only add a new insight if there is another useful non-medical action for the Supporter.
- If nothing actionable is present, return [].
`;

function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Run: npx convex env set GEMINI_API_KEY <your-key>",
    );
  }

  return new GoogleGenAI({ apiKey });
}

function stripCodeFence(rawText: string) {
  return rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function asTrimmedString(value: unknown, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.length <= maxLength
    ? trimmed
    : `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function parseInsightCandidates(
  rawText: string,
  allowedInteractionIds: Set<Id<"voiceInteractions">>,
  allowedSeniorProfileIds: Set<Id<"seniorProfiles">>,
) {
  const parsed = JSON.parse(stripCodeFence(rawText)) as unknown;
  if (!Array.isArray(parsed)) {
    return [] as AiInsightCandidate[];
  }

  const dedupe = new Set<string>();
  const normalized: AiInsightCandidate[] = [];

  for (const item of parsed) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Record<string, unknown>;
    const seniorProfileId =
      typeof candidate.seniorProfileId === "string" &&
      allowedSeniorProfileIds.has(
        candidate.seniorProfileId as Id<"seniorProfiles">,
      )
        ? (candidate.seniorProfileId as Id<"seniorProfiles">)
        : null;
    const sourceVoiceInteractionId =
      typeof candidate.sourceVoiceInteractionId === "string" &&
      allowedInteractionIds.has(
        candidate.sourceVoiceInteractionId as Id<"voiceInteractions">,
      )
        ? (candidate.sourceVoiceInteractionId as Id<"voiceInteractions">)
        : null;
    const insightType =
      typeof candidate.insightType === "string" &&
      ALLOWED_INSIGHT_TYPES.has(
        candidate.insightType as AiInsightCandidate["insightType"],
      )
        ? (candidate.insightType as AiInsightCandidate["insightType"])
        : null;
    const priority =
      typeof candidate.priority === "string" &&
      ALLOWED_PRIORITIES.has(candidate.priority as AiInsightCandidate["priority"])
        ? (candidate.priority as AiInsightCandidate["priority"])
        : "normal";
    const title = asTrimmedString(candidate.title, 120);
    const summary = asTrimmedString(candidate.summary, 320);
    const suggestedAction = asTrimmedString(candidate.suggestedAction, 240);
    const evidenceTranscript = asTrimmedString(candidate.evidenceTranscript, 220);

    if (
      !seniorProfileId ||
      !insightType ||
      !title ||
      !summary ||
      !suggestedAction
    ) {
      continue;
    }

    const dedupeKey = `${seniorProfileId}:${title.toLowerCase()}`;
    if (dedupe.has(dedupeKey)) {
      continue;
    }
    dedupe.add(dedupeKey);

    normalized.push({
      seniorProfileId,
      sourceVoiceInteractionId,
      insightType,
      priority,
      title,
      summary,
      suggestedAction,
      evidenceTranscript,
    });
  }

  return normalized.slice(0, 3);
}

async function generateInsightsForFamilySpace(
  ai: GoogleGenAI,
  interactions: PendingInteraction[],
) {
  const allowedInteractionIds = new Set(
    interactions.map((interaction) => interaction.interactionId),
  );
  const allowedSeniorProfileIds = new Set(
    interactions.map((interaction) => interaction.seniorProfileId),
  );
  const prompt = JSON.stringify(
    {
      interactionIds: [...allowedInteractionIds],
      seniorProfileIds: [...allowedSeniorProfileIds],
      transcripts: interactions.map((interaction) => ({
        interactionId: interaction.interactionId,
        seniorProfileId: interaction.seniorProfileId,
        seniorName: interaction.seniorName,
        channel: interaction.channel,
        sessionType: interaction.sessionType,
        intentType: interaction.intentType,
        draftConfirmationStatus: interaction.draftConfirmationStatus,
        distressDetected: interaction.distressDetected,
        medicalRejected: interaction.medicalRejected,
        createdAtIso: new Date(interaction.createdAt).toISOString(),
        transcript: interaction.transcript,
        assistantResponse: interaction.assistantResponse,
        transcriptExcerpt: buildTranscriptExcerpt(interaction.transcript, 180),
      })),
    },
    null,
    2,
  );

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const rawText = response.text ?? "[]";
  try {
    return parseInsightCandidates(
      rawText,
      allowedInteractionIds,
      allowedSeniorProfileIds,
    );
  } catch {
    return [] as AiInsightCandidate[];
  }
}

export const processPendingInsights = internalAction({
  args: {
    familySpaceId: v.optional(v.id("familySpaces")),
  },
  handler: async (ctx, args) => {
    const pending = (await ctx.runQuery(
      internal.voiceHelpers.listPendingVoiceInteractionsForInsights,
      { familySpaceId: args.familySpaceId },
    )) as PendingInteraction[];

    if (pending.length === 0) {
      return {
        familySpacesProcessed: 0,
        interactionsProcessed: 0,
        insightsCreated: 0,
      };
    }

    const grouped = new Map<Id<"familySpaces">, PendingInteraction[]>();
    for (const interaction of pending) {
      const bucket = grouped.get(interaction.familySpaceId) ?? [];
      if (bucket.length < 8) {
        bucket.push(interaction);
      }
      grouped.set(interaction.familySpaceId, bucket);
    }

    const ai = getAiClient();
    let familySpacesProcessed = 0;
    let interactionsProcessed = 0;
    let insightsCreated = 0;

    for (const [familySpaceId, interactions] of grouped) {
      const insights = await generateInsightsForFamilySpace(ai, interactions);
      await ctx.runMutation(internal.insights.storeAiInsightsBatch, {
        familySpaceId,
        processedInteractionIds: interactions.map(
          (interaction) => interaction.interactionId,
        ),
        insights,
      });

      familySpacesProcessed += 1;
      interactionsProcessed += interactions.length;
      insightsCreated += insights.length;
    }

    return {
      familySpacesProcessed,
      interactionsProcessed,
      insightsCreated,
    };
  },
});
