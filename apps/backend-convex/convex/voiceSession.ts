import { v } from "convex/values";
import { mutation, type MutationCtx } from "./_generated/server";
import { getIndependentMembershipForSeniorProfile } from "./circleAuth";
import { createMemoryRecord } from "./memoryHelpers";
import {
  formatTimeLabel,
  getDayOfWeekForDateKey,
  normalizeDateKey,
  normalizeDaysOfWeek,
  parseTimeInputToMinutes,
  replaceRoutineOccurrences,
  resolveCircleTimeZone,
} from "./routineHelpers";
import { scheduleRoutineCheckIns } from "./routineCheckInScheduler";
import { validateSeniorSession } from "./seniorAccessHelpers";
import { normalizeOptionalText } from "./security";
import { formatInvalidSessionMessage } from "./terminology";

async function requireIndependentVoiceActor(
  ctx: MutationCtx,
  args: { sessionToken: string; deviceFingerprint: string },
) {
  const validation = await validateSeniorSession(ctx, {
    sessionToken: args.sessionToken,
    deviceFingerprint: args.deviceFingerprint,
    expectedSessionType: "independent_web",
  });

  if (validation.status === "invalid") {
    throw new Error(formatInvalidSessionMessage(validation.reason));
  }

  if (validation.seniorProfile.seniorMode !== "independent") {
    throw new Error("This session is not authorized for the creator experience.");
  }

  const membership = await getIndependentMembershipForSeniorProfile(
    ctx,
    validation.circle?._id ?? null,
    validation.seniorProfile._id,
  );

  return { validation, membership };
}

export const confirmIndependentVoiceDraft = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    interactionId: v.id("voiceInteractions"),
    intent: v.union(v.literal("memory"), v.literal("routine")),
    title: v.string(),
    description: v.string(),
    date: v.optional(v.string()),
    timeLabel: v.optional(v.string()),
    timeMinutes: v.optional(v.number()),
    daysOfWeek: v.optional(v.array(v.number())),
  },
  handler: async (ctx, args) => {
    const { validation, membership } = await requireIndependentVoiceActor(ctx, {
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
    });

    const interaction = await ctx.db.get(args.interactionId);
    if (
      !interaction ||
      interaction.circleId !== validation.circle?._id ||
      interaction.seniorProfileId !== validation.seniorProfile._id
    ) {
      throw new Error("This voice draft is no longer available.");
    }

    if (interaction.draftConfirmationStatus !== "pending") {
      throw new Error("This voice draft is not waiting for confirmation.");
    }

    const title = normalizeOptionalText(args.title);
    const description = normalizeOptionalText(args.description);
    if (!title || !description) {
      throw new Error("Both a title and a description are required.");
    }

    const normalizedDate = normalizeDateKey(args.date ?? undefined);
    if (args.date && !normalizedDate) {
      throw new Error("The supplied date must be in YYYY-MM-DD format.");
    }

    if (args.intent === "memory") {
      const memoryRecordId = await createMemoryRecord(ctx, {
        seniorProfileId: validation.seniorProfile._id,
        circleMembershipId: membership?._id ?? null,
        recordType: "voice",
        title,
        transcript: description,
        memoryDate: normalizedDate ?? null,
      });

      await ctx.db.patch(interaction._id, {
        draftTitle: title,
        draftDescription: description,
        draftDate: normalizedDate ?? null,
        draftConfirmationStatus: "confirmed",
        savedMemoryRecordId: memoryRecordId,
        updatedAt: Date.now(),
      });

      return {
        savedEntityType: "memory" as const,
        savedEntityId: memoryRecordId,
      };
    }

    const rawTimeMinutes =
      args.timeMinutes ??
      (args.timeLabel ? parseTimeInputToMinutes(args.timeLabel) : null);
    if (rawTimeMinutes === null || rawTimeMinutes < 0 || rawTimeMinutes >= 1440) {
      throw new Error("A valid routine time is required.");
    }

    let normalizedDays = normalizeDaysOfWeek(args.daysOfWeek ?? []);
    const startDate = normalizedDate;
    let endDate: string | undefined;

    if (normalizedDate && normalizedDays.length === 0) {
      normalizedDays = [getDayOfWeekForDateKey(normalizedDate)];
      endDate = normalizedDate;
    }

    if (normalizedDays.length === 0) {
      throw new Error("A routine needs either a date or one or more days.");
    }

    const timezone = await resolveCircleTimeZone(
      ctx,
      validation.circle?._id ?? null,
    );
    const routineScheduleId = await ctx.db.insert("routineSchedules", {
      seniorProfileId: validation.seniorProfile._id,
      title,
      aiInstructions: description,
      daysOfWeek: normalizedDays,
      startTimeMinutes: rawTimeMinutes,
      timeLabel: formatTimeLabel(rawTimeMinutes),
      durationMinutes: null,
      timezone,
      startDate,
      endDate,
      status: "active",
      createdByCircleMembershipId: membership?._id ?? null,
      updatedByCircleMembershipId: membership?._id ?? null,
      lastEditedAt: Date.now(),
    });

    const schedule = await ctx.db.get(routineScheduleId);
    if (!schedule) {
      throw new Error("Unable to save this routine.");
    }

    const createdOccurrences = await replaceRoutineOccurrences(ctx, schedule);
    await scheduleRoutineCheckIns(ctx, createdOccurrences);

    await ctx.db.patch(interaction._id, {
      draftTitle: title,
      draftDescription: description,
      draftDate: normalizedDate ?? null,
      draftTimeLabel: formatTimeLabel(rawTimeMinutes),
      draftTimeMinutes: rawTimeMinutes,
      draftDaysOfWeek: normalizedDays,
      draftConfirmationStatus: "confirmed",
      savedRoutineScheduleId: routineScheduleId,
      updatedAt: Date.now(),
    });

    return {
      savedEntityType: "routine" as const,
      savedEntityId: routineScheduleId,
    };
  },
});

export const rejectIndependentVoiceDraft = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    interactionId: v.id("voiceInteractions"),
  },
  handler: async (ctx, args) => {
    const { validation } = await requireIndependentVoiceActor(ctx, {
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
    });

    const interaction = await ctx.db.get(args.interactionId);
    if (
      !interaction ||
      interaction.circleId !== validation.circle?._id ||
      interaction.seniorProfileId !== validation.seniorProfile._id
    ) {
      throw new Error("This voice draft is no longer available.");
    }

    await ctx.db.patch(interaction._id, {
      draftConfirmationStatus: "rejected",
      updatedAt: Date.now(),
    });

    return { rejected: true as const };
  },
});
