import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

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

type TimeZoneClock = {
  currentMinutes: number;
  dateKey: string;
};

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

function getDayOfWeekForDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
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

export async function resolveFamilySpaceTimeZone(
  ctx: DbCtx,
  familySpaceId: Id<"familySpaces">,
) {
  const familySpace = await ctx.db.get(familySpaceId);
  if (familySpace?.timezone) {
    return familySpace.timezone;
  }

  const activeSchedule = await ctx.db
    .query("routineSchedules")
    .withIndex("by_familySpaceId_and_status", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("status", "active"),
    )
    .first();

  return activeSchedule?.timezone ?? "UTC";
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
    await ctx.db.delete(occurrence._id);
  }

  if (schedule.status !== "active") {
    return;
  }

  const { dateKey } = getTimeZoneClock(new Date(), schedule.timezone);
  for (let dayOffset = 0; dayOffset <= LOOKAHEAD_DAYS; dayOffset += 1) {
    const occurrenceDateKey = addDaysToDateKey(dateKey, dayOffset);
    const dayOfWeek = getDayOfWeekForDateKey(occurrenceDateKey);

    if (!routineMatchesDay(schedule.daysOfWeek, dayOfWeek)) {
      continue;
    }

    await ctx.db.insert("routineOccurrences", {
      familySpaceId: schedule.familySpaceId,
      routineScheduleId: schedule._id,
      occurrenceDateKey,
      startTimeMinutes: schedule.startTimeMinutes,
      timeLabel: schedule.timeLabel,
      timezone: schedule.timezone,
      status: "scheduled",
    });
  }
}

export async function listTodayTimelineForFamilySpace(
  ctx: QueryCtx,
  familySpaceId: Id<"familySpaces">,
) {
  const familySpace = await ctx.db.get(familySpaceId);
  if (!familySpace) {
    return [] as RoutineTimelineItem[];
  }

  const timeZone = await resolveFamilySpaceTimeZone(ctx, familySpaceId);
  const { dateKey } = getTimeZoneClock(new Date(), timeZone);
  const occurrences = await ctx.db
    .query("routineOccurrences")
    .withIndex(
      "by_familySpaceId_status_occurrenceDateKey_startTimeMinutes",
      (query) =>
        query
          .eq("familySpaceId", familySpaceId)
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

export async function getNextRoutineEventForFamilySpace(
  ctx: QueryCtx,
  familySpaceId: Id<"familySpaces">,
) {
  const familySpace = await ctx.db.get(familySpaceId);
  if (!familySpace) {
    return null;
  }

  const timeZone = await resolveFamilySpaceTimeZone(ctx, familySpaceId);
  const clock = getTimeZoneClock(new Date(), timeZone);
  const occurrences = await ctx.db
    .query("routineOccurrences")
    .withIndex(
      "by_familySpaceId_status_occurrenceDateKey_startTimeMinutes",
      (query) =>
        query
          .eq("familySpaceId", familySpaceId)
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

export async function listRoutineSchedulesForFamilySpace(
  ctx: QueryCtx,
  familySpaceId: Id<"familySpaces">,
) {
  const schedules = await ctx.db
    .query("routineSchedules")
    .withIndex("by_familySpaceId_and_lastEditedAt", (query) =>
      query.eq("familySpaceId", familySpaceId),
    )
    .order("desc")
    .take(100);

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
    lastEditedAt: schedule.lastEditedAt,
  }));
}
