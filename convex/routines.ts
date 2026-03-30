import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireFamilySpaceMembership } from "./familySpaceAuth";
import { normalizeOptionalText } from "./security";
import {
  describeRoutineDays,
  formatTimeLabel,
  listRoutineSchedulesForFamilySpace,
  normalizeDateKey,
  normalizeDaysOfWeek,
  parseTimeInputToMinutes,
  replaceRoutineOccurrences,
} from "./routineHelpers";

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
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
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

    await replaceRoutineOccurrences(ctx, schedule);
    return routineScheduleId;
  },
});

export const listRoutineSchedules = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    return await listRoutineSchedulesForFamilySpace(ctx, membership.familySpaceId);
  },
});

export const getRoutineSchedule = query({
  args: {
    routineScheduleId: v.id("routineSchedules"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
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
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const schedule = await ctx.db.get(args.routineScheduleId);
    if (!schedule || schedule.familySpaceId !== membership.familySpaceId) {
      throw new Error("This routine schedule does not belong to your FamilySpace.");
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

    await replaceRoutineOccurrences(ctx, updatedSchedule);
    return schedule._id;
  },
});

export const deleteRoutineSchedule = mutation({
  args: {
    routineScheduleId: v.id("routineSchedules"),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "supporter");
    const schedule = await ctx.db.get(args.routineScheduleId);
    if (!schedule || schedule.familySpaceId !== membership.familySpaceId) {
      throw new Error("This routine schedule does not belong to your FamilySpace.");
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
