import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { issueSeniorAccessSession } from "./seniorAccessHelpers";
import { getOccurrenceStartTimestampMs, parseTimeInputToMinutes } from "./routineHelpers";

process.env.MEMVELLA_AUTH_PEPPER = "memvella-test-pepper";

// convex-test expects Vitest's import.meta.glob module map at runtime.
// @ts-expect-error Vitest provides import.meta.glob, but this repo's Convex tsc config does not include Vite types.
const modules = import.meta.glob("./**/*.ts");

async function seedRoutineWorkspace() {
  const t = convexTest(schema, modules);
  const ids = await t.run(async (ctx) => {
    const circleId = await ctx.db.insert("circles", {
      displayName: "Routine Workspace",
      timezone: "Europe/London",
      locale: "en-GB",
    });
    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      circleId,
      displayName: "David",
      seniorMode: "assisted",
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });
    const ownerMembershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken: "routine-owner",
      authEmail: "routine-owner@memvella.test",
      displayName: "Owner",
      role: "organiser",
      seniorProfileId,
      onboardingStep: undefined,
      lastSeenAt: Date.now(),
    });
    const supporterMembershipId = await ctx.db.insert("circleMemberships", {
      circleId,
      authIdentityToken: "routine-supporter",
      authEmail: "routine-supporter@memvella.test",
      displayName: "Supporter",
      role: "member",
      seniorProfileId,
      onboardingStep: undefined,
      lastSeenAt: Date.now(),
    });

    return { circleId, seniorProfileId, ownerMembershipId, supporterMembershipId };
  });

  return {
    t,
    ids,
    owner: t.withIdentity({ tokenIdentifier: "routine-owner" }),
    supporter: t.withIdentity({ tokenIdentifier: "routine-supporter" }),
  };
}

describe("routine authorization", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it("allows owners and denies Supporters for routine mutations", async () => {
    const { owner, supporter, t, ids } = await seedRoutineWorkspace();

    const routineScheduleId = await t.run(async (ctx) => {
      return await ctx.db.insert("routineSchedules", {
        seniorProfileId: ids.seniorProfileId,
        title: "Morning tablets",
        aiInstructions: null,
        daysOfWeek: [1, 2, 3, 4, 5],
        startTimeMinutes: 510,
        timeLabel: "8:30 AM",
        durationMinutes: 10,
        timezone: "Europe/London",
        startDate: undefined,
        endDate: undefined,
        status: "active",
        createdByCircleMembershipId: ids.ownerMembershipId,
        updatedByCircleMembershipId: ids.ownerMembershipId,
        lastEditedAt: Date.now(),
      });
    });
    expect(routineScheduleId).toBeTruthy();

    await expect(
      owner.mutation(api.routines.deleteRoutineSchedule, { routineScheduleId }),
    ).resolves.toEqual({ deleted: true });
    await t.finishAllScheduledFunctions(vi.runAllTimers);

    const blockedScheduleId = await t.run(async (ctx) => {
      return await ctx.db.insert("routineSchedules", {
        seniorProfileId: ids.seniorProfileId,
        title: "Evening tablets",
        aiInstructions: null,
        daysOfWeek: [1],
        startTimeMinutes: 1260,
        timeLabel: "9:00 PM",
        durationMinutes: null,
        timezone: "Europe/London",
        startDate: undefined,
        endDate: undefined,
        status: "active",
        createdByCircleMembershipId: ids.ownerMembershipId,
        updatedByCircleMembershipId: ids.ownerMembershipId,
        lastEditedAt: Date.now(),
      });
    });

    await expect(
      supporter.mutation(api.routines.updateRoutineSchedule, {
        routineScheduleId: blockedScheduleId,
        title: "Supporter edit",
        startTime: "09:00",
        daysOfWeek: [1],
        timezone: "Europe/London",
      }),
    ).rejects.toThrow("This account does not have access to that Workspace setting.");
    await expect(
      supporter.mutation(api.routines.deleteRoutineSchedule, {
        routineScheduleId: blockedScheduleId,
      }),
    ).rejects.toThrow("This account does not have access to that Workspace setting.");
  });
});

describe("routine check-in transitions", () => {
  it.each(["confirmed", "unconfirmed"] as const)("keeps %s transitions scoped to the paired senior session", async (outcome) => {
    const { t, ids } = await seedRoutineWorkspace();

    const seeded = await t.run(async (ctx) => {
      const scheduleId = await ctx.db.insert("routineSchedules", {
        seniorProfileId: ids.seniorProfileId,
        title: "Drink water",
        aiInstructions: null,
        daysOfWeek: [1],
        startTimeMinutes: 540,
        timeLabel: "9:00 AM",
        durationMinutes: null,
        timezone: "Europe/London",
        startDate: undefined,
        endDate: undefined,
        status: "active",
        createdByCircleMembershipId: ids.ownerMembershipId,
        updatedByCircleMembershipId: ids.ownerMembershipId,
        lastEditedAt: Date.now(),
      });
      const occurrenceId = await ctx.db.insert("routineOccurrences", {
        seniorProfileId: ids.seniorProfileId,
        routineScheduleId: scheduleId,
        occurrenceDateKey: "2026-07-05",
        startTimeMinutes: 540,
        timeLabel: "9:00 AM",
        timezone: "Europe/London",
        status: "scheduled",
      });
      const session = await issueSeniorAccessSession(ctx, {
        circleId: ids.circleId,
        seniorProfileId: ids.seniorProfileId,
        sessionType: "assisted_device",
        deviceFingerprint: "routine-device",
        sourcePinId: null,
        sourceCircleMembershipId: ids.ownerMembershipId,
      });

      const otherCircleId = await ctx.db.insert("circles", {
        displayName: "Other Routine Workspace",
        timezone: "Europe/London",
        locale: "en-GB",
      });
      const otherSeniorProfileId = await ctx.db.insert("seniorProfiles", {
        circleId: otherCircleId,
        displayName: "Amira",
        seniorMode: "assisted",
        accessStatus: "active",
        timezone: null,
        locale: null,
        lastSessionAt: undefined,
      });
      const otherSession = await issueSeniorAccessSession(ctx, {
        circleId: otherCircleId,
        seniorProfileId: otherSeniorProfileId,
        sessionType: "assisted_device",
        deviceFingerprint: "other-routine-device",
        sourcePinId: null,
        sourceCircleMembershipId: null,
      });

      return { scheduleId, occurrenceId, session, otherSession };
    });

    const queued = await t.mutation(internal.routines.queueRoutineCheckIn, {
      routineOccurrenceId: seeded.occurrenceId,
    });
    expect(queued.queued).toBe(true);
    const checkInId = queued.checkInId as Id<"routineCheckIns">;

    await expect(
      t.mutation(api.routines.markRoutineCheckInPrompted, {
        sessionToken: seeded.otherSession.sessionToken,
        deviceFingerprint: "other-routine-device",
        checkInId,
        promptText: "Time for water.",
      }),
    ).rejects.toThrow("This routine check-in is no longer available.");

    await expect(
      t.mutation(api.routines.markRoutineCheckInPrompted, {
        sessionToken: seeded.session.sessionToken,
        deviceFingerprint: "wrong-device",
        checkInId,
        promptText: "Time for water.",
      }),
    ).rejects.toThrow("This assisted session is no longer active.");

    await expect(
      t.mutation(api.routines.markRoutineCheckInPrompted, {
        sessionToken: seeded.session.sessionToken,
        deviceFingerprint: "routine-device",
        checkInId,
        promptText: " Time for water. ",
      }),
    ).resolves.toEqual({ updated: true });

    await expect(
      t.mutation(api.routines.resolveRoutineCheckIn, {
        sessionToken: seeded.session.sessionToken,
        deviceFingerprint: "routine-device",
        checkInId,
        outcome,
        responseTranscript: "Not yet",
      }),
    ).resolves.toEqual({ updated: true });

    const stored = await t.run(async (ctx) => ({
      checkIn: await ctx.db.get(checkInId),
      occurrence: await ctx.db.get(seeded.occurrenceId),
    }));
    expect(stored.checkIn).toMatchObject({
      status: outcome,
      promptText: "Time for water.",
      responseTranscript: "Not yet",
    });
    expect(stored.occurrence).toMatchObject({ status: outcome === "confirmed" ? "completed" : "unconfirmed" });
  });
});

describe("recurring routine lifecycle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T08:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  const dailyRoutine = {
    title: "Morning tea", startTime: "09:00", daysOfWeek: [0, 1, 2, 3, 4, 5, 6], timezone: "Europe/London",
  };

  it("renews beyond the original 45 days without duplicates or changing completed reminders", async () => {
    const { t, owner } = await seedRoutineWorkspace();
    const routineScheduleId = await owner.mutation(api.routines.createRoutineSchedule, dailyRoutine);
    const original = await t.run((ctx) => ctx.db.query("routineOccurrences").withIndex("by_routineScheduleId", (q) => q.eq("routineScheduleId", routineScheduleId)).take(100));
    expect(original).toHaveLength(46);
    await t.run((ctx) => ctx.db.patch(original[0]._id, { status: "completed" }));
    expect(await t.mutation(internal.routines.renewRoutineOccurrences, { routineScheduleId })).toBe(0);
    expect(await t.run((ctx) => ctx.db.get(original[0]._id))).toMatchObject({ status: "completed" });

    vi.setSystemTime(new Date("2026-03-01T08:00:00Z"));
    expect(await t.mutation(internal.routines.renewRoutineOccurrences, { routineScheduleId })).toBe(46);
    expect(await t.mutation(internal.routines.renewRoutineOccurrences, { routineScheduleId })).toBe(0);
    const renewed = await t.run((ctx) => ctx.db.query("routineOccurrences").withIndex("by_routineScheduleId", (q) => q.eq("routineScheduleId", routineScheduleId)).take(150));
    expect(renewed).toHaveLength(92);
    expect(new Set(renewed.map((item) => item.occurrenceDateKey)).size).toBe(92);
    expect(renewed.some((item) => item.occurrenceDateKey === "2026-04-15")).toBe(true);
  });

  it("pauses pending reminders, preserves completed history and resumes without duplicating it", async () => {
    const { t, owner } = await seedRoutineWorkspace();
    const routineScheduleId = await owner.mutation(api.routines.createRoutineSchedule, dailyRoutine);
    const original = await t.run((ctx) => ctx.db.query("routineOccurrences").withIndex("by_routineScheduleId", (q) => q.eq("routineScheduleId", routineScheduleId)).take(100));
    await t.run((ctx) => ctx.db.patch(original[0]._id, { status: "completed" }));
    await owner.mutation(api.routines.updateRoutineSchedule, { ...dailyRoutine, routineScheduleId, status: "paused" });
    expect(await t.mutation(internal.routines.renewRoutineOccurrences, { routineScheduleId })).toBe(0);
    expect(await t.mutation(internal.routines.queueRoutineCheckIn, { routineOccurrenceId: original[1]._id })).toMatchObject({ queued: false });
    await owner.mutation(api.routines.updateRoutineSchedule, { ...dailyRoutine, routineScheduleId, status: "active" });
    const resumed = await t.run((ctx) => ctx.db.query("routineOccurrences").withIndex("by_routineScheduleId", (q) => q.eq("routineScheduleId", routineScheduleId)).take(100));
    expect(resumed).toHaveLength(46);
    expect(resumed.find((item) => item._id === original[0]._id)?.status).toBe("completed");
  });

  it("honours an end date and does not replay reminders from earlier today", async () => {
    const { t, owner } = await seedRoutineWorkspace();
    vi.setSystemTime(new Date("2026-01-01T16:00:00Z"));
    const routineScheduleId = await owner.mutation(api.routines.createRoutineSchedule, { ...dailyRoutine, endDate: "2026-01-03" });
    const occurrences = await t.run((ctx) => ctx.db.query("routineOccurrences").withIndex("by_routineScheduleId", (q) => q.eq("routineScheduleId", routineScheduleId)).take(100));
    expect(occurrences.map((item) => item.occurrenceDateKey)).toEqual(["2026-01-02", "2026-01-03"]);
    vi.setSystemTime(new Date("2026-01-04T08:00:00Z"));
    expect(await t.mutation(internal.routines.renewRoutineOccurrences, { routineScheduleId })).toBe(0);
  });

  it.each([
    { startTime: "25:90" }, { startTime: "noon" }, { timezone: "not/a-timezone" },
    { daysOfWeek: [1.5] }, { startDate: "2026-02-30" },
    { startDate: "2026-02-01", endDate: "2026-01-01" }, { durationMinutes: -1 },
  ])("rejects invalid schedule input before storing it: %j", async (invalid) => {
    const { t, owner } = await seedRoutineWorkspace();
    await expect(owner.mutation(api.routines.createRoutineSchedule, { ...dailyRoutine, ...invalid })).rejects.toThrow();
    expect(await t.run((ctx) => ctx.db.query("routineSchedules").take(1))).toEqual([]);
  });
});

describe("routine clock conversion", () => {
  it("handles midnight, noon and valid 12-hour input", () => {
    expect(parseTimeInputToMinutes("00:00")).toBe(0);
    expect(parseTimeInputToMinutes("12:00 AM")).toBe(0);
    expect(parseTimeInputToMinutes("12:00 PM")).toBe(720);
    expect(parseTimeInputToMinutes("9:30 pm")).toBe(1290);
  });
  it("keeps local midnight and ordinary reminders on the correct side of a clock change", () => {
    expect(new Date(getOccurrenceStartTimestampMs("2026-01-01", 0, "America/New_York")).toISOString()).toBe("2026-01-01T05:00:00.000Z");
    expect(new Date(getOccurrenceStartTimestampMs("2026-03-28", 540, "Europe/London")).toISOString()).toBe("2026-03-28T09:00:00.000Z");
    expect(new Date(getOccurrenceStartTimestampMs("2026-03-29", 540, "Europe/London")).toISOString()).toBe("2026-03-29T08:00:00.000Z");
  });
});
