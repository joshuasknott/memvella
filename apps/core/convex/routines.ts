import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import {
  getSeniorProfileByMode,
  requireFamilySpaceMembership,
} from "./familySpaceAuth";
import {
  describeRoutineDays,
  formatTimeLabel,
  listRoutineSchedulesForFamilySpace,
  normalizeDateKey,
  normalizeDaysOfWeek,
  parseTimeInputToMinutes,
  replaceRoutineOccurrences,
} from "./routineHelpers";
import { scheduleRoutineRetreatCheckIns } from "./routineRetreatScheduler";
import { validateSeniorSession } from "./seniorAccessHelpers";
import { normalizeOptionalText } from "./security";

export const createRoutineSchedule = mutation({
  args: {
    title: v.string(),
    startTime: v.string(),
    daysOfWeek: v.array(v.number()),
    timezone: v.string(),
    aiInstructions: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const title = normalizeOptionalText(args.title);
    const normalizedDaysOfWeek = normalizeDaysOfWeek(args.daysOfWeek);

    if (!title) {
      throw new Error("A routine title is required.");
    }

    if (normalizedDaysOfWeek.length === 0) {
      throw new Error("Choose at least one day for this routine.");
    }

    const startTimeMinutes = parseTimeInputToMinutes(args.startTime);
    const routineScheduleId = await ctx.db.insert("routineSchedules", {
      familySpaceId: membership.familySpaceId,
      title,
      aiInstructions: normalizeOptionalText(args.aiInstructions) ?? null,
      daysOfWeek: normalizedDaysOfWeek,
      startTimeMinutes,
      timeLabel: formatTimeLabel(startTimeMinutes),
      durationMinutes: args.durationMinutes ?? null,
      timezone: args.timezone,
      startDate: normalizeDateKey(args.startDate) ?? undefined,
      endDate: normalizeDateKey(args.endDate) ?? undefined,
      status: "active",
      createdByMembershipId: membership._id,
      updatedByMembershipId: membership._id,
      lastEditedAt: Date.now(),
    });

    await ctx.db.patch(membership.familySpaceId, {
      timezone: args.timezone,
    });

    const schedule = await ctx.db.get(routineScheduleId);
    if (!schedule) {
      throw new Error("Unable to save this routine schedule.");
    }

    const createdOccurrences = await replaceRoutineOccurrences(ctx, schedule);
    await scheduleRoutineRetreatCheckIns(ctx, createdOccurrences);
    return routineScheduleId;
  },
});

export const listRoutineSchedules = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    return await listRoutineSchedulesForFamilySpace(ctx, membership.familySpaceId);
  },
});

export const getRoutineSchedule = query({
  args: {
    routineScheduleId: v.id("routineSchedules"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const schedule = await ctx.db.get(args.routineScheduleId);

    if (!schedule || schedule.familySpaceId !== membership.familySpaceId) {
      return null;
    }

    return {
      id: schedule._id,
      title: schedule.title,
      time: schedule.timeLabel,
      startTimeMinutes: schedule.startTimeMinutes,
      daysOfWeek: schedule.daysOfWeek,
      frequency: describeRoutineDays(schedule.daysOfWeek),
      aiInstructions: schedule.aiInstructions,
      durationMinutes: schedule.durationMinutes,
      timezone: schedule.timezone,
      startDate: schedule.startDate ?? null,
      endDate: schedule.endDate ?? null,
      status: schedule.status,
    };
  },
});

export const updateRoutineSchedule = mutation({
  args: {
    routineScheduleId: v.id("routineSchedules"),
    title: v.string(),
    startTime: v.string(),
    daysOfWeek: v.array(v.number()),
    timezone: v.string(),
    aiInstructions: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("paused"))),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const schedule = await ctx.db.get(args.routineScheduleId);
    if (!schedule || schedule.familySpaceId !== membership.familySpaceId) {
      throw new Error("This routine schedule does not belong to your Circle.");
    }

    const title = normalizeOptionalText(args.title);
    const normalizedDaysOfWeek = normalizeDaysOfWeek(args.daysOfWeek);
    if (!title) {
      throw new Error("A routine title is required.");
    }

    if (normalizedDaysOfWeek.length === 0) {
      throw new Error("Choose at least one day for this routine.");
    }

    const startTimeMinutes = parseTimeInputToMinutes(args.startTime);
    await ctx.db.patch(schedule._id, {
      title,
      aiInstructions: normalizeOptionalText(args.aiInstructions) ?? null,
      daysOfWeek: normalizedDaysOfWeek,
      startTimeMinutes,
      timeLabel: formatTimeLabel(startTimeMinutes),
      durationMinutes: args.durationMinutes ?? null,
      timezone: args.timezone,
      startDate: normalizeDateKey(args.startDate) ?? undefined,
      endDate: normalizeDateKey(args.endDate) ?? undefined,
      status: args.status ?? schedule.status,
      updatedByMembershipId: membership._id,
      lastEditedAt: Date.now(),
    });

    await ctx.db.patch(membership.familySpaceId, {
      timezone: args.timezone,
    });

    const updatedSchedule = await ctx.db.get(schedule._id);
    if (!updatedSchedule) {
      throw new Error("Unable to update this routine schedule.");
    }

    const createdOccurrences = await replaceRoutineOccurrences(ctx, updatedSchedule);
    await scheduleRoutineRetreatCheckIns(ctx, createdOccurrences);
    return schedule._id;
  },
});

export const deleteRoutineSchedule = mutation({
  args: {
    routineScheduleId: v.id("routineSchedules"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const schedule = await ctx.db.get(args.routineScheduleId);
    if (!schedule || schedule.familySpaceId !== membership.familySpaceId) {
      throw new Error("This routine schedule does not belong to your Circle.");
    }

    const occurrences = await ctx.db
      .query("routineOccurrences")
      .withIndex("by_routineScheduleId", (query) =>
        query.eq("routineScheduleId", schedule._id),
      )
      .take(200);

    for (const occurrence of occurrences) {
      await ctx.db.delete(occurrence._id);
    }

    await ctx.db.delete(schedule._id);
    return { deleted: true as const };
  },
});

export const queueRoutineRetreatCheckIn = internalMutation({
  args: {
    routineOccurrenceId: v.id("routineOccurrences"),
  },
  handler: async (ctx, args) => {
    const occurrence = await ctx.db.get(args.routineOccurrenceId);
    if (!occurrence || occurrence.status !== "scheduled") {
      return { queued: false as const, reason: "routine_not_pending" as const };
    }

    const [schedule, assistedSenior] = await Promise.all([
      ctx.db.get(occurrence.routineScheduleId),
      getSeniorProfileByMode(ctx, occurrence.familySpaceId, "assisted"),
    ]);

    if (!schedule || !assistedSenior) {
      return { queued: false as const, reason: "context_missing" as const };
    }

    const existing = await ctx.db
      .query("routineRetreatCheckIns")
      .withIndex("by_routineOccurrenceId", (query) =>
        query.eq("routineOccurrenceId", occurrence._id),
      )
      .unique();

    const now = Date.now();
    if (existing) {
      if (
        existing.status === "confirmed" ||
        existing.status === "unconfirmed" ||
        existing.status === "canceled"
      ) {
        return { queued: false as const, reason: "already_resolved" as const };
      }

      await ctx.db.patch(existing._id, {
        status: "live_prompt_ready",
        ignoredAt: now,
        softCheckInAt: now,
        updatedAt: now,
      });

      return { queued: true as const, checkInId: existing._id };
    }

    const checkInId = await ctx.db.insert("routineRetreatCheckIns", {
      familySpaceId: occurrence.familySpaceId,
      seniorProfileId: assistedSenior._id,
      routineOccurrenceId: occurrence._id,
      routineScheduleId: occurrence.routineScheduleId,
      status: "live_prompt_ready",
      ignoredAt: now,
      softCheckInAt: now,
      promptedAt: null,
      resolvedAt: null,
      promptText: null,
      responseTranscript: null,
      voiceInteractionId: null,
      createdAt: now,
      updatedAt: now,
    });

    return { queued: true as const, checkInId };
  },
});

export const listReadyRetreatCheckIns = query({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, {
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
      expectedSessionType: "assisted_device",
    });
    if (validation.status === "invalid") {
      return [];
    }

    const checkIns = await ctx.db
      .query("routineRetreatCheckIns")
      .withIndex("by_seniorProfileId_and_status_and_softCheckInAt", (query) =>
        query
          .eq("seniorProfileId", validation.seniorProfile._id)
          .eq("status", "live_prompt_ready")
          .lte("softCheckInAt", Date.now()),
      )
      .take(3);

    if (checkIns.length === 0) {
      return [];
    }

    const [occurrences, schedules] = await Promise.all([
      Promise.all(checkIns.map((checkIn) => ctx.db.get(checkIn.routineOccurrenceId))),
      Promise.all(checkIns.map((checkIn) => ctx.db.get(checkIn.routineScheduleId))),
    ]);
    const occurrenceById = new Map(
      occurrences
        .filter((occurrence): occurrence is NonNullable<typeof occurrence> => occurrence !== null)
        .map((occurrence) => [occurrence._id, occurrence]),
    );
    const scheduleById = new Map(
      schedules
        .filter((schedule): schedule is NonNullable<typeof schedule> => schedule !== null)
        .map((schedule) => [schedule._id, schedule]),
    );

    return checkIns
      .map((checkIn) => {
        const occurrence = occurrenceById.get(checkIn.routineOccurrenceId);
        const schedule = scheduleById.get(checkIn.routineScheduleId);
        if (!occurrence || !schedule || occurrence.status !== "scheduled") {
          return null;
        }

        return {
          id: checkIn._id,
          routineOccurrenceId: occurrence._id,
          title: schedule.title,
          timeLabel: occurrence.timeLabel,
          aiInstructions: schedule.aiInstructions,
        };
      })
      .filter((checkIn): checkIn is NonNullable<typeof checkIn> => checkIn !== null);
  },
});

export const markRetreatCheckInPrompted = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    checkInId: v.id("routineRetreatCheckIns"),
    promptText: v.string(),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, {
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
      expectedSessionType: "assisted_device",
    });
    if (validation.status === "invalid") {
      throw new Error("This assisted session is no longer active.");
    }

    const checkIn = await ctx.db.get(args.checkInId);
    if (!checkIn || checkIn.seniorProfileId !== validation.seniorProfile._id) {
      throw new Error("This routine retreat check-in is no longer available.");
    }

    if (checkIn.status !== "live_prompt_ready") {
      return { updated: false as const };
    }

    const now = Date.now();
    await ctx.db.patch(checkIn._id, {
      status: "live_prompt_sent",
      promptedAt: now,
      promptText: normalizeOptionalText(args.promptText) ?? args.promptText,
      updatedAt: now,
    });

    return { updated: true as const };
  },
});

export const resolveRetreatCheckIn = mutation({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    checkInId: v.id("routineRetreatCheckIns"),
    outcome: v.union(v.literal("confirmed"), v.literal("unconfirmed")),
    responseTranscript: v.optional(v.string()),
    voiceInteractionId: v.optional(v.id("voiceInteractions")),
  },
  handler: async (ctx, args) => {
    const validation = await validateSeniorSession(ctx, {
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
      expectedSessionType: "assisted_device",
    });
    if (validation.status === "invalid") {
      throw new Error("This assisted session is no longer active.");
    }

    const checkIn = await ctx.db.get(args.checkInId);
    if (!checkIn || checkIn.seniorProfileId !== validation.seniorProfile._id) {
      throw new Error("This routine retreat check-in is no longer available.");
    }

    if (
      checkIn.status === "confirmed" ||
      checkIn.status === "unconfirmed" ||
      checkIn.status === "canceled"
    ) {
      return { updated: false as const };
    }

    const now = Date.now();
    await ctx.db.patch(checkIn._id, {
      status: args.outcome,
      resolvedAt: now,
      responseTranscript:
        normalizeOptionalText(args.responseTranscript) ?? null,
      voiceInteractionId: args.voiceInteractionId ?? null,
      updatedAt: now,
    });

    if (args.outcome === "unconfirmed") {
      const occurrence = await ctx.db.get(checkIn.routineOccurrenceId);
      if (occurrence && occurrence.status === "scheduled") {
        await ctx.db.patch(occurrence._id, {
          status: "unconfirmed",
        });
      }
    }

    return { updated: true as const };
  },
});
