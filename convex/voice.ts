"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { action, type ActionCtx } from "./_generated/server";
import { describeRoutineDays, formatTimeLabel, normalizeDateKey, normalizeDaysOfWeek } from "./routineHelpers";
import { normalizeOptionalText } from "./security";
import {
  buildMedicalBoundaryReply,
  buildSpeechRetryReply,
  scanVoiceSafety,
} from "./voiceSafety";

type SeniorAiContext = {
  familySpaceName: string;
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
  familyMembers: Array<{
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
};

type ResolvedSeniorSession = {
  familySpaceId: Id<"familySpaces">;
  seniorProfileId: Id<"seniorProfiles">;
  seniorName: string;
  seniorMode: "assisted" | "independent";
  sessionType: "assisted_device" | "independent_web";
  sessionId: Id<"seniorAccessSessions">;
  sourceMembershipId: Id<"familySpaceMemberships"> | null;
};

type IndependentDraft = {
  intent: "memory" | "routine";
  title: string;
  description: string;
  date: string | null;
  timeLabel: string | null;
  timeMinutes: number | null;
  daysOfWeek: number[];
  recurrenceLabel: string | null;
};

type AssistedVoiceActionResult = {
  reply: string;
  interactionId: Id<"voiceInteractions"> | null;
  medicalRejected: boolean;
  distressDetected: boolean;
};

type IndependentVoiceActionResult = {
  reply: string;
  interactionId: Id<"voiceInteractions"> | null;
  medicalRejected: boolean;
  distressDetected: boolean;
  draft: IndependentDraft | null;
};

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

function stripCodeFence(rawText: string) {
  return rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
}

function formatHumanDate(dateKey: string, locale: string, timeZone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return utcDate.toLocaleDateString(locale, {
    timeZone,
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function buildAssistedSystemPrompt(
  seniorName: string,
  context: SeniorAiContext,
  distressDetected: boolean,
) {
  const sections: string[] = [
    `You are Memvella, a calm digital wellness companion for ${seniorName}.`,
    "Use short, grounding sentences.",
    "Only use facts supplied from the active FamilySpace context.",
    "If a fact is missing, say that you do not know.",
    "Never give medical, dosage, diagnostic, or treatment advice.",
    distressDetected
      ? "The transcript contains distress markers. Start with reassurance, then give the clearest helpful next step."
      : "Keep the tone warm and direct.",
    "",
    `Active FamilySpace: ${context.familySpaceName}`,
  ];

  if (context.routines.length > 0) {
    sections.push("Routine Context:");
    for (const routine of context.routines) {
      const scheduleWindow =
        routine.startDate || routine.endDate
          ? ` Active window: ${routine.startDate ?? "now"} to ${routine.endDate ?? "open"}.`
          : "";
      sections.push(
        `- ${routine.title} at ${routine.time} on ${routine.frequency.join(", ")}.${routine.aiInstructions ? ` Notes: ${routine.aiInstructions}.` : ""}${scheduleWindow}`,
      );
    }
  }

  if (context.familyMembers.length > 0) {
    sections.push("", "Connections:");
    for (const member of context.familyMembers) {
      sections.push(
        member.isLiving
          ? `- ${member.name} is ${member.relationship}. ${member.aiContext}`
          : `- ${member.name} was ${member.relationship}. Speak about past memories only. ${member.aiContext}`,
      );
    }
  }

  if (context.recentMemories.length > 0) {
    sections.push("", "Recent Memories:");
    for (const memory of context.recentMemories) {
      sections.push(
        `- ${memory.title}${memory.memoryDate ? ` (${memory.memoryDate})` : ""}: ${memory.summary}`,
      );
    }
  }

  return sections.join("\n");
}

function parseIndependentDraft(rawText: string, transcript: string) {
  const parsed = JSON.parse(stripCodeFence(rawText)) as Record<string, unknown>;
  const rawIntent = parsed.intent;
  if (
    rawIntent !== "memory" &&
    rawIntent !== "routine" &&
    rawIntent !== "unknown"
  ) {
    return null;
  }

  if (rawIntent === "unknown") {
    return null;
  }

  const description =
    normalizeOptionalText(
      typeof parsed.description === "string" ? parsed.description : transcript,
    ) ?? transcript.trim();
  const title =
    normalizeOptionalText(
      typeof parsed.title === "string" ? parsed.title : description,
    ) ?? description;
  const date =
    normalizeDateKey(typeof parsed.date === "string" ? parsed.date : null) ?? null;
  const timeMinutes =
    typeof parsed.timeMinutes === "number" &&
    parsed.timeMinutes >= 0 &&
    parsed.timeMinutes < 1440
      ? Math.trunc(parsed.timeMinutes)
      : null;
  const timeLabel =
    timeMinutes !== null
      ? formatTimeLabel(timeMinutes)
      : typeof parsed.timeLabel === "string"
        ? normalizeOptionalText(parsed.timeLabel) ?? null
        : null;
  const daysOfWeek = normalizeDaysOfWeek(
    Array.isArray(parsed.daysOfWeek)
      ? parsed.daysOfWeek.filter((value): value is number => typeof value === "number")
      : [],
  );

  if (rawIntent === "memory") {
    return {
      intent: "memory" as const,
      title,
      description,
      date,
      timeLabel: null,
      timeMinutes: null,
      daysOfWeek: [],
      recurrenceLabel: null,
    };
  }

  if (timeMinutes === null) {
    return null;
  }

  return {
    intent: "routine" as const,
    title,
    description,
    date,
    timeLabel,
    timeMinutes,
    daysOfWeek,
    recurrenceLabel:
      daysOfWeek.length > 0 ? describeRoutineDays(daysOfWeek).join(", ") : null,
  };
}

function buildIndependentDraftReply(
  draft: IndependentDraft | null,
  locale: string,
  timeZone: string,
) {
  if (!draft) {
    return "Tell me the memory you want to log, or say the routine you want to create.";
  }

  if (draft.intent === "memory") {
    const dateSuffix = draft.date
      ? ` for ${formatHumanDate(draft.date, locale, timeZone)}`
      : "";
    return `I can save "${draft.title}"${dateSuffix}. Is that right?`;
  }

  const datePart = draft.date
    ? ` starting ${formatHumanDate(draft.date, locale, timeZone)}`
    : "";
  const schedulePart =
    draft.daysOfWeek.length > 0
      ? ` on ${describeRoutineDays(draft.daysOfWeek).join(", ")}`
      : draft.date
        ? ""
        : " each day";

  return `I can create "${draft.title}" at ${draft.timeLabel ?? formatTimeLabel(draft.timeMinutes ?? 0)}${schedulePart}${datePart}. Is that right?`;
}

function buildIndependentSystemPrompt(context: SeniorAiContext) {
  const now = new Date();
  const currentDateLabel = now.toLocaleDateString(context.locale, {
    timeZone: context.timeZone,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentTimeLabel = now.toLocaleTimeString(context.locale, {
    timeZone: context.timeZone,
    hour: "numeric",
    minute: "2-digit",
  });

  return `You parse one transcript from an Independent Senior for Memvella.

Return a single valid JSON object with exactly these keys:
- intent: "memory" | "routine" | "unknown"
- title: string | null
- description: string | null
- date: string | null
- timeLabel: string | null
- timeMinutes: number | null
- daysOfWeek: number[]

Rules:
- Use "memory" only when the user is trying to log or remember something personal.
- Use "routine" only when the user is trying to create a reminder or repeating activity.
- Use "unknown" if the transcript is missing the details needed to confirm a save.
- date must be YYYY-MM-DD when known, otherwise null.
- timeMinutes must be an integer from 0 to 1439 when a routine time is known, otherwise null.
- daysOfWeek uses 0=Sunday through 6=Saturday.
- For one-time routines, leave daysOfWeek as [] and use date.
- Resolve relative dates like "tomorrow" using:
  Current date: ${currentDateLabel}
  Current time: ${currentTimeLabel}
  Time zone: ${context.timeZone}
- Do not include markdown or code fences.
`;
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
    const context = (await ctx.runQuery(
      internal.voiceHelpers.gatherSeniorContext,
      { familySpaceId: session.familySpaceId },
    )) as SeniorAiContext;
    const safety = scanVoiceSafety(transcript);

    const reply: string = safety.medicalRejected
      ? buildMedicalBoundaryReply()
      : (
          await getAiClient().models.generateContent({
            model: "gemini-2.5-flash",
            contents: transcript,
            config: {
              systemInstruction: buildAssistedSystemPrompt(
                session.seniorName,
                context,
                safety.distressDetected,
              ),
              temperature: 0.5,
            },
          })
        ).text ?? buildSpeechRetryReply();

    const interactionId: Id<"voiceInteractions"> = await ctx.runMutation(
      internal.voiceHelpers.saveVoiceInteraction,
      {
        familySpaceId: session.familySpaceId,
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

export const parseIndependentVoiceIntent = action({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    transcript: v.string(),
  },
  handler: async (ctx, args): Promise<IndependentVoiceActionResult> => {
    const transcript = args.transcript.trim();
    if (!transcript) {
      return {
        reply: buildSpeechRetryReply(),
        interactionId: null,
        medicalRejected: false,
        distressDetected: false,
        draft: null,
      };
    }

    const session: ResolvedSeniorSession = await ctx.runQuery(
      internal.seniorAccess.resolveSeniorSession,
      {
        sessionToken: args.sessionToken,
        deviceFingerprint: args.deviceFingerprint,
        expectedSessionType: "independent_web",
      },
    );
    await enforceVoiceRateLimit(ctx, session, "parseIndependentVoiceIntent");
    const context = (await ctx.runQuery(
      internal.voiceHelpers.gatherSeniorContext,
      { familySpaceId: session.familySpaceId },
    )) as SeniorAiContext;
    const safety = scanVoiceSafety(transcript);

    if (safety.medicalRejected) {
      const reply = buildMedicalBoundaryReply();
      const interactionId: Id<"voiceInteractions"> = await ctx.runMutation(
        internal.voiceHelpers.saveVoiceInteraction,
        {
          familySpaceId: session.familySpaceId,
          seniorProfileId: session.seniorProfileId,
          sessionType: session.sessionType,
          channel: "independent_voice_loop",
          transcript,
          assistantResponse: reply,
          medicalRejected: true,
          medicalMarkers: safety.medicalMarkers,
          distressDetected: safety.distressDetected,
          distressMarkers: safety.distressMarkers,
          intentType: "medical_rejection",
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
        medicalRejected: true,
        distressDetected: safety.distressDetected,
        draft: null,
      };
    }

    const response = await getAiClient().models.generateContent({
      model: "gemini-2.5-flash",
      contents: transcript,
      config: {
        systemInstruction: buildIndependentSystemPrompt(context),
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    let draft: IndependentDraft | null = null;
    try {
      draft = parseIndependentDraft(response.text ?? "", transcript);
    } catch {
      draft = null;
    }

    const reply = buildIndependentDraftReply(
      draft,
      context.locale,
      context.timeZone,
    );
    const interactionId: Id<"voiceInteractions"> = await ctx.runMutation(
      internal.voiceHelpers.saveVoiceInteraction,
      {
        familySpaceId: session.familySpaceId,
        seniorProfileId: session.seniorProfileId,
        sessionType: session.sessionType,
        channel: "independent_voice_loop",
        transcript,
        assistantResponse: reply,
        medicalRejected: false,
        medicalMarkers: [],
        distressDetected: safety.distressDetected,
        distressMarkers: safety.distressMarkers,
        intentType:
          draft?.intent === "memory"
            ? "memory_draft"
            : draft?.intent === "routine"
              ? "routine_draft"
              : "unknown",
        draftTitle: draft?.title ?? null,
        draftDescription: draft?.description ?? null,
        draftDate: draft?.date ?? null,
        draftTimeLabel: draft?.timeLabel ?? null,
        draftTimeMinutes: draft?.timeMinutes ?? null,
        draftDaysOfWeek: draft?.daysOfWeek ?? [],
        draftConfirmationStatus: draft ? "pending" : "not_applicable",
      },
    );

    return {
      reply,
      interactionId,
      medicalRejected: false,
      distressDetected: safety.distressDetected,
      draft,
    };
  },
});
