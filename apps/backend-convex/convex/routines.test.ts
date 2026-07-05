import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import schema from "./schema";
import { issueSeniorAccessSession } from "./seniorAccessHelpers";

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
  it("keeps prompt and resolve transitions scoped to the paired senior session", async () => {
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
        outcome: "unconfirmed",
        responseTranscript: "Not yet",
      }),
    ).resolves.toEqual({ updated: true });

    const stored = await t.run(async (ctx) => ({
      checkIn: await ctx.db.get(checkInId),
      occurrence: await ctx.db.get(seeded.occurrenceId),
    }));
    expect(stored.checkIn).toMatchObject({
      status: "unconfirmed",
      promptText: "Time for water.",
      responseTranscript: "Not yet",
    });
    expect(stored.occurrence).toMatchObject({ status: "unconfirmed" });
  });
});
