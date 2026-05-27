import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { normalizeUserFacingText } from "./terminology";

type DbCtx = MutationCtx | QueryCtx;

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const LOOKAHEAD_DAYS = 45;

type RoutineTimelineItem = {
  id: string;
  routineScheduleId: string | null;
  time: string;
  title: string;
  type: string;
  frequency: string[];
  daysOfWeek: number[];
  aiInstructions: string | null;
  occurrenceDateKey: string;
  startTimeMinutes: number;
  source: "structured";
};

export type ScheduledRoutineOccurrence = {
  occurrenceId: Id<"routineOccurrences">;
  seniorProfileId: Id<"seniorProfiles">;
  routineScheduleId: Id<"routineSchedules">;
  occurrenceDateKey: string;
  startTimeMinutes: number;
  timezone: string;
  softCheckInAt: number;
};

type TimeZoneClock = {
  currentMinutes: number;
  dateKey: string;
};

export type CircleRuntimeDetails = {
  circle: Doc<"circles"> | null;
  circleName: string;
  timeZone: string;
  locale: string;
};

async function getPrimarySeniorProfileForCircle(
  ctx: DbCtx,
  circleId: Id<"circles">,
) {
  const assistedSenior = await ctx.db
    .query("seniorProfiles")
    .withIndex("by_circleId_and_seniorMode", (query) =>
      query.eq("circleId", circleId).eq("seniorMode", "assisted"),
    )
    .first();
  if (assistedSenior) {
    return assistedSenior;
  }

  return await ctx.db
    .query("seniorProfiles")
    .withIndex("by_circleId_and_seniorMode", (query) =>
      query.eq("circleId", circleId).eq("seniorMode", "independent"),
    )
    .first();
}

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTimeZoneClock(date: Date, timeZone: string): TimeZoneClock {
  const parts = getFormatter(timeZone).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const hour = Number(values.hour ?? "0");
  const minute = Number(values.minute ?? "0");

  return {
    currentMinutes: hour * 60 + minute,
    dateKey: `${values.year}-${values.month}-${values.day}`,
  };
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = getFormatter(timeZone).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const utcFromTimeZoneParts = Date.UTC(
    Number(values.year ?? "1970"),
    Number(values.month ?? "1") - 1,
    Number(values.day ?? "1"),
    Number(values.hour ?? "0"),
    Number(values.minute ?? "0"),
    0,
    0,
  );

  return utcFromTimeZoneParts - date.getTime();
}

export function parseTimeInputToMinutes(timeValue: string) {
  if (timeValue.includes(" ")) {
    const [timePart, meridiem] = timeValue.split(" ");
    const [rawHour, rawMinute] = timePart.split(":").map(Number);
    const normalizedHour =
      meridiem === "PM" && rawHour !== 12
        ? rawHour + 12
        : meridiem === "AM" && rawHour === 12
          ? 0
          : rawHour;

    return normalizedHour * 60 + (rawMinute ?? 0);
  }

  const [hour, minute] = timeValue.split(":").map(Number);
  return hour * 60 + (minute ?? 0);
}

export function formatTimeLabel(startTimeMinutes: number) {
  const normalizedMinutes = ((startTimeMinutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalizedMinutes / 60);
  const minute = normalizedMinutes % 60;
  const meridiem = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute.toString().padStart(2, "0")} ${meridiem}`;
}

export function normalizeDaysOfWeek(daysOfWeek: number[]) {
  return [...new Set(daysOfWeek)]
    .map((day) => Math.trunc(day))
    .filter((day) => day >= 0 && day <= 6)
    .sort((left, right) => left - right);
}

export function normalizeDateKey(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : undefined;
}

export function describeRoutineDays(daysOfWeek: number[]) {
  if (daysOfWeek.length === 7) {
    return ["Daily"];
  }

  if (daysOfWeek.length === 2 && daysOfWeek[0] === 0 && daysOfWeek[1] === 6) {
    return ["Weekends"];
  }

  return daysOfWeek.map((day) => DAY_NAMES[day]);
}

export function addDaysToDateKey(dateKey: string, daysToAdd: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + daysToAdd));

  return `${nextDate.getUTCFullYear()}-${String(
    nextDate.getUTCMonth() + 1,
  ).padStart(2, "0")}-${String(nextDate.getUTCDate()).padStart(2, "0")}`;
}

export function getDayOfWeekForDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function getOccurrenceStartTimestampMs(
  occurrenceDateKey: string,
  startTimeMinutes: number,
  timeZone: string,
) {
  const [year, month, day] = occurrenceDateKey.split("-").map(Number);
  const hour = Math.floor(startTimeMinutes / 60);
  const minute = startTimeMinutes % 60;
  const firstGuess = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  const firstOffset = getTimeZoneOffsetMs(new Date(firstGuess), timeZone);
  const adjusted = firstGuess - firstOffset;
  const secondOffset = getTimeZoneOffsetMs(new Date(adjusted), timeZone);

  return adjusted - (secondOffset - firstOffset);
}

function routineMatchesDay(daysOfWeek: number[], dayOfWeek: number) {
  return daysOfWeek.includes(dayOfWeek);
}

function buildStructuredTimelineItem(
  occurrence: Doc<"routineOccurrences">,
  schedule: Doc<"routineSchedules">,
): RoutineTimelineItem {
  return {
    id: occurrence._id,
    routineScheduleId: schedule._id,
    time: occurrence.timeLabel,
    title: schedule.title,
    type: describeRoutineDays(schedule.daysOfWeek)[0] ?? "Scheduled",
    frequency: describeRoutineDays(schedule.daysOfWeek),
    daysOfWeek: schedule.daysOfWeek,
    aiInstructions: schedule.aiInstructions,
    occurrenceDateKey: occurrence.occurrenceDateKey,
    startTimeMinutes: occurrence.startTimeMinutes,
    source: "structured",
  };
}

export async function resolveCircleRuntimeDetails(
  ctx: DbCtx,
  circleId: Id<"circles"> | null,
) {
  if (!circleId) {
    return {
      circle: null,
      circleName: "Circle",
      timeZone: "UTC",
      locale: "en-US",
    } satisfies CircleRuntimeDetails;
  }

  const circle = await ctx.db.get(circleId);
  if (!circle) {
    return {
      circle: null,
      circleName: "Circle",
      timeZone: "UTC",
      locale: "en-US",
    } satisfies CircleRuntimeDetails;
  }

  if (circle.timezone) {
    return {
      circle,
      circleName: normalizeUserFacingText(circle.displayName) ?? "Circle",
      timeZone: circle.timezone,
      locale: circle.locale ?? "en-US",
    } satisfies CircleRuntimeDetails;
  }

  const primarySenior = await getPrimarySeniorProfileForCircle(ctx, circle._id);
  if (!primarySenior) {
    return {
      circle,
      circleName: normalizeUserFacingText(circle.displayName) ?? "Circle",
      timeZone: "UTC",
      locale: circle.locale ?? "en-US",
    } satisfies CircleRuntimeDetails;
  }

  const activeSchedule = await ctx.db
    .query("routineSchedules")
    .withIndex("by_seniorProfileId_and_status", (query) =>
      query.eq("seniorProfileId", primarySenior._id).eq("status", "active"),
    )
    .first();

  return {
    circle,
    circleName: normalizeUserFacingText(circle.displayName) ?? "Circle",
    timeZone: activeSchedule?.timezone ?? "UTC",
    locale: circle.locale ?? "en-US",
  } satisfies CircleRuntimeDetails;
}

export async function resolveCircleTimeZone(
  ctx: DbCtx,
  circleId: Id<"circles"> | null,
) {
  const details = await resolveCircleRuntimeDetails(ctx, circleId);
  return details.timeZone;
}

export async function replaceRoutineOccurrences(
  ctx: MutationCtx,
  schedule: Doc<"routineSchedules">,
) {
  const existingOccurrences = await ctx.db
    .query("routineOccurrences")
    .withIndex("by_routineScheduleId", (query) =>
      query.eq("routineScheduleId", schedule._id),
    )
    .take(200);

  for (const occurrence of existingOccurrences) {
    const checkIns = await ctx.db
      .query("routineCheckIns")
      .withIndex("by_routineOccurrenceId", (query) =>
        query.eq("routineOccurrenceId", occurrence._id),
      )
      .take(10);

    const now = Date.now();
    for (const checkIn of checkIns) {
      if (
        checkIn.status === "live_prompt_ready" ||
        checkIn.status === "live_prompt_sent"
      ) {
        await ctx.db.patch(checkIn._id, {
          status: "canceled",
          resolvedAt: now,
          updatedAt: now,
        });
      } else if (
        checkIn.status !== "confirmed" &&
        checkIn.status !== "unconfirmed" &&
        checkIn.status !== "canceled"
      ) {
        await ctx.db.delete(checkIn._id);
      }
    }

    await ctx.db.delete(occurrence._id);
  }

  if (schedule.status !== "active") {
    return [] as ScheduledRoutineOccurrence[];
  }

  const { dateKey } = getTimeZoneClock(new Date(), schedule.timezone);
  const startDate = normalizeDateKey(schedule.startDate);
  const endDate = normalizeDateKey(schedule.endDate);
  const createdOccurrences: ScheduledRoutineOccurrence[] = [];
  for (let dayOffset = 0; dayOffset <= LOOKAHEAD_DAYS; dayOffset += 1) {
    const occurrenceDateKey = addDaysToDateKey(dateKey, dayOffset);
    if (startDate && occurrenceDateKey < startDate) {
      continue;
    }

    if (endDate && occurrenceDateKey > endDate) {
      continue;
    }

    const dayOfWeek = getDayOfWeekForDateKey(occurrenceDateKey);

    if (!routineMatchesDay(schedule.daysOfWeek, dayOfWeek)) {
      continue;
    }

    const occurrenceId = await ctx.db.insert("routineOccurrences", {
      seniorProfileId: schedule.seniorProfileId,
      routineScheduleId: schedule._id,
      occurrenceDateKey,
      startTimeMinutes: schedule.startTimeMinutes,
      timeLabel: schedule.timeLabel,
      timezone: schedule.timezone,
      status: "scheduled",
    });

    createdOccurrences.push({
      occurrenceId,
      seniorProfileId: schedule.seniorProfileId,
      routineScheduleId: schedule._id,
      occurrenceDateKey,
      startTimeMinutes: schedule.startTimeMinutes,
      timezone: schedule.timezone,
      softCheckInAt:
        getOccurrenceStartTimestampMs(
          occurrenceDateKey,
          schedule.startTimeMinutes,
          schedule.timezone,
        ) +
        15 * 60 * 1000,
    });
  }

  return createdOccurrences;
}

export async function listTodayTimelineForCircle(
  ctx: QueryCtx,
  circleId: Id<"circles">,
) {
  const [details, seniorProfile] = await Promise.all([
    resolveCircleRuntimeDetails(ctx, circleId),
    getPrimarySeniorProfileForCircle(ctx, circleId),
  ]);
  if (!details.circle || !seniorProfile) {
    return [] as RoutineTimelineItem[];
  }

  const timeZone = details.timeZone;
  const { dateKey } = getTimeZoneClock(new Date(), timeZone);
  const occurrences = await ctx.db
    .query("routineOccurrences")
    .withIndex("by_seniorProfileId_status_occurrenceDateKey_startTimeMinutes", (query) =>
      query
        .eq("seniorProfileId", seniorProfile._id)
        .eq("status", "scheduled")
        .eq("occurrenceDateKey", dateKey),
    )
    .take(64);

  if (occurrences.length === 0) {
    return [] as RoutineTimelineItem[];
  }

  const schedules = await Promise.all(
    occurrences.map((occurrence) => ctx.db.get(occurrence.routineScheduleId)),
  );
  const scheduleById = new Map(
    schedules
      .filter((schedule): schedule is NonNullable<typeof schedule> => schedule !== null)
      .map((schedule) => [schedule._id, schedule]),
  );

  return occurrences
    .map((occurrence) => {
      const schedule = scheduleById.get(occurrence.routineScheduleId);
      return schedule ? buildStructuredTimelineItem(occurrence, schedule) : null;
    })
    .filter((item): item is RoutineTimelineItem => item !== null);
}

export async function listTodayTimelineForSenior(
  ctx: QueryCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  const seniorProfile = await ctx.db.get(seniorProfileId);
  if (!seniorProfile) {
    return [] as RoutineTimelineItem[];
  }

  const details = await resolveCircleRuntimeDetails(ctx, seniorProfile.circleId);
  const timeZone = seniorProfile.timezone ?? details.timeZone;
  const { dateKey } = getTimeZoneClock(new Date(), timeZone);
  const occurrences = await ctx.db
    .query("routineOccurrences")
    .withIndex("by_seniorProfileId_status_occurrenceDateKey_startTimeMinutes", (query) =>
      query
        .eq("seniorProfileId", seniorProfile._id)
        .eq("status", "scheduled")
        .eq("occurrenceDateKey", dateKey),
    )
    .take(64);

  if (occurrences.length === 0) {
    return [] as RoutineTimelineItem[];
  }

  const schedules = await Promise.all(
    occurrences.map((occurrence) => ctx.db.get(occurrence.routineScheduleId)),
  );
  const scheduleById = new Map(
    schedules
      .filter((schedule): schedule is NonNullable<typeof schedule> => schedule !== null)
      .map((schedule) => [schedule._id, schedule]),
  );

  return occurrences
    .map((occurrence) => {
      const schedule = scheduleById.get(occurrence.routineScheduleId);
      return schedule ? buildStructuredTimelineItem(occurrence, schedule) : null;
    })
    .filter((item): item is RoutineTimelineItem => item !== null);
}

export async function getNextRoutineEventForCircle(
  ctx: QueryCtx,
  circleId: Id<"circles">,
) {
  const [details, seniorProfile] = await Promise.all([
    resolveCircleRuntimeDetails(ctx, circleId),
    getPrimarySeniorProfileForCircle(ctx, circleId),
  ]);
  if (!details.circle || !seniorProfile) {
    return null;
  }

  const timeZone = details.timeZone;
  const clock = getTimeZoneClock(new Date(), timeZone);
  const occurrences = await ctx.db
    .query("routineOccurrences")
    .withIndex("by_seniorProfileId_status_occurrenceDateKey_startTimeMinutes", (query) =>
      query
        .eq("seniorProfileId", seniorProfile._id)
        .eq("status", "scheduled")
        .gte("occurrenceDateKey", clock.dateKey),
    )
    .take(120);

  if (occurrences.length > 0) {
    const schedules = await Promise.all(
      occurrences.map((occurrence) => ctx.db.get(occurrence.routineScheduleId)),
    );
    const scheduleById = new Map(
      schedules
        .filter((schedule): schedule is NonNullable<typeof schedule> => schedule !== null)
        .map((schedule) => [schedule._id, schedule]),
    );

    for (const occurrence of occurrences) {
      if (
        occurrence.occurrenceDateKey === clock.dateKey &&
        occurrence.startTimeMinutes < clock.currentMinutes
      ) {
        continue;
      }

      const schedule = scheduleById.get(occurrence.routineScheduleId);
      if (!schedule) {
        continue;
      }

      return buildStructuredTimelineItem(occurrence, schedule);
    }
  }

  return null;
}

export async function getNextRoutineEventForSenior(
  ctx: QueryCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  const seniorProfile = await ctx.db.get(seniorProfileId);
  if (!seniorProfile) {
    return null;
  }

  const details = await resolveCircleRuntimeDetails(ctx, seniorProfile.circleId);
  const timeZone = seniorProfile.timezone ?? details.timeZone;
  const clock = getTimeZoneClock(new Date(), timeZone);
  const occurrences = await ctx.db
    .query("routineOccurrences")
    .withIndex("by_seniorProfileId_status_occurrenceDateKey_startTimeMinutes", (query) =>
      query
        .eq("seniorProfileId", seniorProfile._id)
        .eq("status", "scheduled")
        .gte("occurrenceDateKey", clock.dateKey),
    )
    .take(120);

  if (occurrences.length > 0) {
    const schedules = await Promise.all(
      occurrences.map((occurrence) => ctx.db.get(occurrence.routineScheduleId)),
    );
    const scheduleById = new Map(
      schedules
        .filter((schedule): schedule is NonNullable<typeof schedule> => schedule !== null)
        .map((schedule) => [schedule._id, schedule]),
    );

    for (const occurrence of occurrences) {
      if (
        occurrence.occurrenceDateKey === clock.dateKey &&
        occurrence.startTimeMinutes < clock.currentMinutes
      ) {
        continue;
      }

      const schedule = scheduleById.get(occurrence.routineScheduleId);
      if (!schedule) {
        continue;
      }

      return buildStructuredTimelineItem(occurrence, schedule);
    }
  }

  return null;
}

export async function listRoutineSchedulesForSenior(
  ctx: QueryCtx,
  seniorProfileId: Id<"seniorProfiles">,
  limit = 100,
) {
  const schedules = await ctx.db
    .query("routineSchedules")
    .withIndex("by_seniorProfileId_and_lastEditedAt", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .order("desc")
    .take(limit);

  return schedules.map((schedule) => ({
    id: schedule._id,
    title: schedule.title,
    time: schedule.timeLabel,
    daysOfWeek: schedule.daysOfWeek,
    frequency: describeRoutineDays(schedule.daysOfWeek),
    aiInstructions: schedule.aiInstructions,
    status: schedule.status,
    durationMinutes: schedule.durationMinutes,
    timezone: schedule.timezone,
    startDate: schedule.startDate ?? null,
    endDate: schedule.endDate ?? null,
    lastEditedAt: schedule.lastEditedAt,
  }));
}

export async function listRoutineSchedulesForCircle(
  ctx: QueryCtx,
  circleId: Id<"circles">,
  limit = 100,
) {
  const seniorProfile = await getPrimarySeniorProfileForCircle(ctx, circleId);
  if (!seniorProfile) {
    return [];
  }

  return await listRoutineSchedulesForSenior(ctx, seniorProfile._id, limit);
}
