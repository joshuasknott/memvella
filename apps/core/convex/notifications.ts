import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import { requireFamilySpaceMembership } from "./familySpaceAuth";
import {
  addDaysToDateKey,
  getNextRoutineEventForFamilySpace,
} from "./routineHelpers";
import { normalizeOptionalText } from "./security";
import {
  ADMIN_DEVICE_LABEL,
  CIRCLE_LABEL,
  normalizeUserFacingText,
} from "./terminology";

const DAILY_SUMMARY_DEFAULT_TIME_MINUTES = 19 * 60;
const ROUTINE_REMINDER_LOOKAHEAD_MINUTES = 15;

function permissionStateValidator() {
  return v.union(
    v.literal("granted"),
    v.literal("denied"),
    v.literal("prompt"),
    v.literal("unsupported"),
  );
}

function notificationTypeValidator() {
  return v.union(
    v.literal("routine_reminder"),
    v.literal("urgent_alert"),
    v.literal("daily_summary"),
  );
}

function deliveryStatusValidator() {
  return v.union(
    v.literal("queued"),
    v.literal("sent"),
    v.literal("failed"),
    v.literal("skipped"),
  );
}

function buildDefaultSettings(
  membershipId: Id<"familySpaceMemberships">,
  updatedAt: number,
) {
  return {
    dailySummary: true,
    urgentAlerts: true,
    routineReminders: false,
    dailySummaryTimeMinutes: DAILY_SUMMARY_DEFAULT_TIME_MINUTES,
    updatedByMembershipId: membershipId,
    updatedAt,
  };
}

async function getNotificationSettingsRecord(
  ctx: MutationCtx | QueryCtx,
  familySpaceId: Id<"familySpaces">,
) {
  return await ctx.db
    .query("notificationSettings")
    .withIndex("by_familySpaceId", (query) =>
      query.eq("familySpaceId", familySpaceId),
    )
    .unique();
}

function getFormatter(timeZone: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTimeZoneClock(date: Date, timeZone: string) {
  const parts = getFormatter(timeZone).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  const hour = Number(values.hour ?? "0");
  const minute = Number(values.minute ?? "0");

  return {
    dateKey: `${values.year}-${values.month}-${values.day}`,
    currentMinutes: hour * 60 + minute,
  };
}

function getUtcDateKey(offsetDays = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(
    date.getUTCDate(),
  ).padStart(2, "0")}`;
}

function buildCurrentDeviceLabel(input: string | undefined) {
  const normalized = normalizeOptionalText(input);
  return normalizeUserFacingText(normalized) ?? ADMIN_DEVICE_LABEL;
}

async function listActivePushSubscriptionsForFamilySpace(
  ctx: MutationCtx | QueryCtx,
  familySpaceId: Id<"familySpaces">,
) {
  return await ctx.db
    .query("pushSubscriptions")
    .withIndex("by_familySpaceId_and_revokedAt", (query) =>
      query.eq("familySpaceId", familySpaceId).eq("revokedAt", null),
    )
    .take(25);
}

function getMinutesUntilOccurrence(
  now: Date,
  occurrence: Pick<Doc<"routineOccurrences">, "occurrenceDateKey" | "startTimeMinutes" | "timezone">,
) {
  const clock = getTimeZoneClock(now, occurrence.timezone);
  if (occurrence.occurrenceDateKey === clock.dateKey) {
    return occurrence.startTimeMinutes - clock.currentMinutes;
  }

  const nextDateKey = addDaysToDateKey(clock.dateKey, 1);
  if (occurrence.occurrenceDateKey === nextDateKey) {
    return 1440 - clock.currentMinutes + occurrence.startTimeMinutes;
  }

  return null;
}

async function buildDailySummaryBody(
  ctx: QueryCtx,
  familySpaceId: Id<"familySpaces">,
) {
  const [queuedInsights, nextRoutine, recentVoiceInteractions] = await Promise.all([
    ctx.db
      .query("supporterInsights")
      .withIndex("by_familySpaceId_and_status_and_createdAt", (query) =>
        query.eq("familySpaceId", familySpaceId).eq("status", "queued"),
      )
      .take(20),
    getNextRoutineEventForFamilySpace(ctx, familySpaceId),
    ctx.db
      .query("voiceInteractions")
      .withIndex("by_familySpaceId_and_createdAt", (query) =>
        query.eq("familySpaceId", familySpaceId),
      )
      .order("desc")
      .take(24),
  ]);

  const now = Date.now();
  const last24Hours = recentVoiceInteractions.filter(
    (interaction) => now - interaction.createdAt <= 24 * 60 * 60 * 1000,
  ).length;

  if (queuedInsights.length > 0 && nextRoutine) {
    return `${queuedInsights.length} insight${queuedInsights.length === 1 ? "" : "s"} are waiting, and the next routine is ${nextRoutine.title} at ${nextRoutine.time}.`;
  }

  if (queuedInsights.length > 0) {
    return `${queuedInsights.length} insight${queuedInsights.length === 1 ? "" : "s"} are waiting for review in your Circle.`;
  }

  if (nextRoutine) {
    return `${last24Hours} voice update${last24Hours === 1 ? "" : "s"} were logged in the last day. Next routine: ${nextRoutine.title} at ${nextRoutine.time}.`;
  }

  return `${last24Hours} voice update${last24Hours === 1 ? "" : "s"} were logged in the last day. Your Circle has no upcoming routine right now.`;
}

export const getSupporterNotificationSettings = query({
  args: {},
  handler: async (ctx) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const [settings, activeSubscriptions] = await Promise.all([
      getNotificationSettingsRecord(ctx, membership.familySpaceId),
      listActivePushSubscriptionsForFamilySpace(ctx, membership.familySpaceId),
    ]);

    const resolvedSettings = {
      ...buildDefaultSettings(membership._id, 0),
      ...(settings ?? {}),
    };

    return {
      ...resolvedSettings,
      activeSubscriptions: activeSubscriptions.map((subscription) => ({
        id: subscription._id,
        deviceLabel: subscription.deviceLabel ?? ADMIN_DEVICE_LABEL,
        userAgent: subscription.userAgent,
        lastSeenAt: subscription.lastSeenAt,
        lastDeliveryAt: subscription.lastDeliveryAt,
        failureCount: subscription.failureCount,
      })),
    };
  },
});

export const updateSupporterNotificationSettings = mutation({
  args: {
    dailySummary: v.boolean(),
    urgentAlerts: v.boolean(),
    routineReminders: v.boolean(),
    dailySummaryTimeMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const existing = await getNotificationSettingsRecord(ctx, membership.familySpaceId);
    const updatedAt = Date.now();
    const payload = {
      dailySummary: args.dailySummary,
      urgentAlerts: args.urgentAlerts,
      routineReminders: args.routineReminders,
      dailySummaryTimeMinutes:
        args.dailySummaryTimeMinutes ?? DAILY_SUMMARY_DEFAULT_TIME_MINUTES,
      updatedByMembershipId: membership._id,
      updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("notificationSettings", {
      familySpaceId: membership.familySpaceId,
      ...payload,
    });
  },
});

export const upsertPushSubscription = mutation({
  args: {
    endpoint: v.string(),
    expirationTime: v.union(v.number(), v.null()),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    deviceLabel: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    permissionState: permissionStateValidator(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (query) => query.eq("endpoint", args.endpoint))
      .unique();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        familySpaceId: membership.familySpaceId,
        membershipId: membership._id,
        expirationTime: args.expirationTime,
        p256dh: args.keys.p256dh,
        auth: args.keys.auth,
        deviceLabel: buildCurrentDeviceLabel(args.deviceLabel),
        userAgent: normalizeOptionalText(args.userAgent) ?? null,
        permissionState: args.permissionState,
        updatedAt: now,
        lastSeenAt: now,
        revokedAt: null,
        revokedReason: null,
      });

      return existing._id;
    }

    return await ctx.db.insert("pushSubscriptions", {
      familySpaceId: membership.familySpaceId,
      membershipId: membership._id,
      endpoint: args.endpoint,
      expirationTime: args.expirationTime,
      p256dh: args.keys.p256dh,
      auth: args.keys.auth,
      deviceLabel: buildCurrentDeviceLabel(args.deviceLabel),
      userAgent: normalizeOptionalText(args.userAgent) ?? null,
      permissionState: args.permissionState,
      createdAt: now,
      updatedAt: now,
      lastSeenAt: now,
      lastDeliveryAt: null,
      lastFailureAt: null,
      failureCount: 0,
      revokedAt: null,
      revokedReason: null,
    });
  },
});

export const revokePushSubscription = mutation({
  args: {
    endpoint: v.string(),
  },
  handler: async (ctx, args) => {
    const { membership } = await requireFamilySpaceMembership(ctx, "family_side");
    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (query) => query.eq("endpoint", args.endpoint))
      .unique();

    if (!existing || existing.familySpaceId !== membership.familySpaceId) {
      return { revoked: false as const };
    }

    await ctx.db.patch(existing._id, {
      revokedAt: Date.now(),
      revokedReason: "supporter_disabled_push",
      updatedAt: Date.now(),
    });

    return { revoked: true as const };
  },
});

export const listRoutineReminderCandidates = internalQuery({
  args: {
    lookaheadMinutes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lookaheadMinutes = args.lookaheadMinutes ?? ROUTINE_REMINDER_LOOKAHEAD_MINUTES;
    const occurrenceDateKeys = [getUtcDateKey(-1), getUtcDateKey(0), getUtcDateKey(1)];
    const occurrenceBuckets = await Promise.all(
      occurrenceDateKeys.map((occurrenceDateKey) =>
        ctx.db
          .query("routineOccurrences")
          .withIndex("by_status_occurrenceDateKey_startTimeMinutes", (query) =>
            query.eq("status", "scheduled").eq("occurrenceDateKey", occurrenceDateKey),
          )
          .take(200),
      ),
    );

    const now = new Date();
    const uniqueOccurrences = new Map<
      Id<"routineOccurrences">,
      Doc<"routineOccurrences">
    >();
    for (const bucket of occurrenceBuckets) {
      for (const occurrence of bucket) {
        uniqueOccurrences.set(occurrence._id, occurrence);
      }
    }

    const schedules = await Promise.all(
      [...uniqueOccurrences.values()].map((occurrence) =>
        ctx.db.get(occurrence.routineScheduleId),
      ),
    );
    const scheduleById = new Map(
      schedules
        .filter((schedule): schedule is NonNullable<typeof schedule> => schedule !== null)
        .map((schedule) => [schedule._id, schedule]),
    );

    const settingsByFamilySpaceId = new Map<
      Id<"familySpaces">,
      Awaited<ReturnType<typeof getNotificationSettingsRecord>>
    >();

    const candidates = [] as Array<{
      occurrenceId: Id<"routineOccurrences">;
      familySpaceId: Id<"familySpaces">;
      title: string;
      timeLabel: string;
      scheduledFor: number;
      minutesUntil: number;
    }>;

    for (const occurrence of uniqueOccurrences.values()) {
      const minutesUntil = getMinutesUntilOccurrence(now, occurrence);
      if (
        minutesUntil === null ||
        minutesUntil < 0 ||
        minutesUntil > lookaheadMinutes
      ) {
        continue;
      }

      const schedule = scheduleById.get(occurrence.routineScheduleId);
      if (!schedule) {
        continue;
      }

      const cachedSettings = settingsByFamilySpaceId.get(occurrence.familySpaceId);
      const settings =
        cachedSettings ??
        (await getNotificationSettingsRecord(ctx, occurrence.familySpaceId));
      settingsByFamilySpaceId.set(occurrence.familySpaceId, settings);
      if (!settings?.routineReminders) {
        continue;
      }

      candidates.push({
        occurrenceId: occurrence._id,
        familySpaceId: occurrence.familySpaceId,
        title: schedule.title,
        timeLabel: occurrence.timeLabel,
        scheduledFor: Date.now() + minutesUntil * 60 * 1000,
        minutesUntil,
      });
    }

    return candidates.sort((left, right) => left.scheduledFor - right.scheduledFor);
  },
});

export const listDailySummaryCandidates = internalQuery({
  args: {},
  handler: async (ctx) => {
    const settingsRecords = await ctx.db
      .query("notificationSettings")
      .withIndex("by_dailySummary_and_familySpaceId", (query) =>
        query.eq("dailySummary", true),
      )
      .take(100);

    const familySpaces = await Promise.all(
      settingsRecords.map((settings) => ctx.db.get(settings.familySpaceId)),
    );

    const now = new Date();
    const candidates = [] as Array<{
      familySpaceId: Id<"familySpaces">;
      summaryDateKey: string;
      scheduledFor: number;
    }>;

    for (const settings of settingsRecords) {
      const familySpace =
        familySpaces.find((candidate) => candidate?._id === settings.familySpaceId) ??
        null;
      const timeZone = familySpace?.timezone ?? "UTC";
      const clock = getTimeZoneClock(now, timeZone);
      const minutesFromDigest = Math.abs(
        clock.currentMinutes - settings.dailySummaryTimeMinutes,
      );

      if (minutesFromDigest > ROUTINE_REMINDER_LOOKAHEAD_MINUTES) {
        continue;
      }

      const activeSubscriptions = await listActivePushSubscriptionsForFamilySpace(
        ctx,
        settings.familySpaceId,
      );
      if (activeSubscriptions.length === 0) {
        continue;
      }

      candidates.push({
        familySpaceId: settings.familySpaceId,
        summaryDateKey: clock.dateKey,
        scheduledFor: Date.now(),
      });
    }

    return candidates;
  },
});

export const getDailySummaryDigestPayload = internalQuery({
  args: {
    familySpaceId: v.id("familySpaces"),
  },
  handler: async (ctx, args) => {
    const familySpace = await ctx.db.get(args.familySpaceId);
    const title = familySpace?.displayName
      ? `${normalizeUserFacingText(familySpace.displayName) ?? familySpace.displayName} daily summary`
      : `Your ${CIRCLE_LABEL} daily summary`;
    const body = await buildDailySummaryBody(ctx, args.familySpaceId);

    return {
      title,
      body,
      deepLink: "/supporter/insights",
      payloadTag: "daily-summary",
    };
  },
});

export const getUrgentInsightDispatchPlan = internalQuery({
  args: {
    insightId: v.id("supporterInsights"),
  },
  handler: async (ctx, args) => {
    const insight = await ctx.db.get(args.insightId);
    if (!insight) {
      return null;
    }

    const settings = await getNotificationSettingsRecord(ctx, insight.familySpaceId);
    if (!settings?.urgentAlerts) {
      return null;
    }

    const activeSubscriptions = await listActivePushSubscriptionsForFamilySpace(
      ctx,
      insight.familySpaceId,
    );
    if (activeSubscriptions.length === 0) {
      return null;
    }

    return {
      familySpaceId: insight.familySpaceId,
      title: insight.title,
      body: insight.summary,
      deepLink: "/supporter/insights",
      payloadTag: "urgent-alert",
      subscriptions: activeSubscriptions.map((subscription) => ({
        pushSubscriptionId: subscription._id,
        membershipId: subscription.membershipId,
      })),
    };
  },
});

export const listActivePushSubscriptions = internalQuery({
  args: {
    familySpaceId: v.id("familySpaces"),
  },
  handler: async (ctx, args) => {
    const subscriptions = await listActivePushSubscriptionsForFamilySpace(
      ctx,
      args.familySpaceId,
    );

    return subscriptions.map((subscription) => ({
      pushSubscriptionId: subscription._id,
      membershipId: subscription.membershipId,
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      deviceLabel: subscription.deviceLabel,
      userAgent: subscription.userAgent,
    }));
  },
});

export const enqueueNotificationDelivery = internalMutation({
  args: {
    familySpaceId: v.id("familySpaces"),
    membershipId: v.id("familySpaceMemberships"),
    pushSubscriptionId: v.id("pushSubscriptions"),
    notificationType: notificationTypeValidator(),
    dedupeKey: v.string(),
    title: v.string(),
    body: v.string(),
    deepLink: v.union(v.string(), v.null()),
    scheduledFor: v.number(),
    payloadTag: v.union(v.string(), v.null()),
    routineOccurrenceId: v.optional(v.id("routineOccurrences")),
    supporterInsightId: v.optional(v.id("supporterInsights")),
    summaryDateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notificationDeliveries")
      .withIndex("by_dedupeKey", (query) => query.eq("dedupeKey", args.dedupeKey))
      .unique();

    if (existing) {
      return { deliveryId: existing._id, created: false as const };
    }

    const now = Date.now();
    const deliveryId = await ctx.db.insert("notificationDeliveries", {
      familySpaceId: args.familySpaceId,
      membershipId: args.membershipId,
      pushSubscriptionId: args.pushSubscriptionId,
      notificationType: args.notificationType,
      dedupeKey: args.dedupeKey,
      title: args.title,
      body: args.body,
      deepLink: args.deepLink,
      scheduledFor: args.scheduledFor,
      payloadTag: args.payloadTag,
      routineOccurrenceId: args.routineOccurrenceId ?? null,
      supporterInsightId: args.supporterInsightId ?? null,
      summaryDateKey: args.summaryDateKey ?? null,
      status: "queued",
      createdAt: now,
      updatedAt: now,
      dispatchedAt: null,
      lastError: null,
    });

    return { deliveryId, created: true as const };
  },
});

export const listQueuedNotificationDeliveries = internalQuery({
  args: {
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const deliveries = await ctx.db
      .query("notificationDeliveries")
      .withIndex("by_status_and_scheduledFor", (query) =>
        query.eq("status", "queued").lte("scheduledFor", args.now),
      )
      .take(40);

    const subscriptions = await Promise.all(
      deliveries.map((delivery) => ctx.db.get(delivery.pushSubscriptionId)),
    );
    const subscriptionById = new Map(
      subscriptions
        .filter(
          (subscription): subscription is NonNullable<typeof subscription> =>
            subscription !== null,
        )
        .map((subscription) => [subscription._id, subscription]),
    );

    return deliveries
      .map((delivery) => {
        const subscription = subscriptionById.get(delivery.pushSubscriptionId);
        if (!subscription || subscription.revokedAt !== null) {
          return null;
        }

        return {
          deliveryId: delivery._id,
          pushSubscriptionId: subscription._id,
          endpoint: subscription.endpoint,
          expirationTime: subscription.expirationTime,
          p256dh: subscription.p256dh,
          auth: subscription.auth,
          title: delivery.title,
          body: delivery.body,
          deepLink: delivery.deepLink,
          payloadTag: delivery.payloadTag,
        };
      })
      .filter((delivery): delivery is NonNullable<typeof delivery> => delivery !== null);
  },
});

export const markNotificationDeliveryResult = internalMutation({
  args: {
    deliveryId: v.id("notificationDeliveries"),
    pushSubscriptionId: v.id("pushSubscriptions"),
    status: deliveryStatusValidator(),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    await ctx.db.patch(args.deliveryId, {
      status: args.status,
      updatedAt: now,
      dispatchedAt: now,
      lastError: normalizeOptionalText(args.errorMessage) ?? null,
    });

    const subscription = await ctx.db.get(args.pushSubscriptionId);
    if (!subscription) {
      return args.deliveryId;
    }

    if (args.status === "sent") {
      await ctx.db.patch(subscription._id, {
        lastDeliveryAt: now,
        lastFailureAt: null,
        failureCount: 0,
        updatedAt: now,
      });
      return args.deliveryId;
    }

    if (args.status === "skipped") {
      await ctx.db.patch(subscription._id, {
        updatedAt: now,
      });
      return args.deliveryId;
    }

    const nextFailureCount = subscription.failureCount + 1;
    const shouldRevoke = nextFailureCount >= 5;
    await ctx.db.patch(subscription._id, {
      lastFailureAt: now,
      failureCount: nextFailureCount,
      updatedAt: now,
      ...(shouldRevoke
        ? {
            revokedAt: now,
            revokedReason: "push_delivery_failed_repeatedly",
          }
        : {}),
    });

    return args.deliveryId;
  },
});
