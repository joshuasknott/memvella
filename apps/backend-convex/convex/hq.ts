import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";

const DEFAULT_CAP = 500;
const RECENT_CAP = 100;
const DETAIL_CAP = 200;
const DAY_MS = 24 * 60 * 60 * 1000;

type BoundedCount = {
  value: number;
  cap: number;
  capped: boolean;
};

type StatusCount = Record<string, number>;

export function isAuthorizedHqReadToken(token: string | undefined) {
  const expected = process.env.MEMVELLA_HQ_READ_TOKEN?.trim();
  if (!expected || !token) {
    return false;
  }

  if (expected.length !== token.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < expected.length; index += 1) {
    diff |= expected.charCodeAt(index) ^ token.charCodeAt(index);
  }
  return diff === 0;
}

function requireHqReadToken(token: string) {
  if (!isAuthorizedHqReadToken(token)) {
    throw new Error("HQ read access denied.");
  }
}

function boundedCount(length: number, cap = DEFAULT_CAP): BoundedCount {
  return {
    value: Math.min(length, cap),
    cap,
    capped: length > cap,
  };
}

function redactIdLabel(prefix: string, id: string) {
  return `${prefix} #${id.slice(-6)}`;
}

export function redactEmailForHq(email: string) {
  const [local, domain] = email.toLowerCase().split("@");
  if (!local || !domain) {
    return "redacted-email";
  }

  return `${local.slice(0, 1)}***@${domain}`;
}

function countBy<T extends string>(values: T[]): Record<T, number> {
  return values.reduce(
    (accumulator, value) => ({
      ...accumulator,
      [value]: (accumulator[value] ?? 0) + 1,
    }),
    {} as Record<T, number>,
  );
}

function domainFromReferrer(referrer: string | null) {
  if (!referrer) {
    return "direct";
  }

  try {
    return new URL(referrer).hostname.toLowerCase();
  } catch {
    return "unparsed";
  }
}

function mapAlertTypeForHq(alertType: Doc<"alerts">["alertType"]) {
  if (alertType === "escalation") {
    return "safety_boundary";
  }
  return alertType;
}

async function countTable(ctx: QueryCtx, table: "circles"): Promise<BoundedCount>;
async function countTable(
  ctx: QueryCtx,
  table: "seniorProfiles",
): Promise<BoundedCount>;
async function countTable(
  ctx: QueryCtx,
  table: "routineSchedules",
): Promise<BoundedCount>;
async function countTable(
  ctx: QueryCtx,
  table: "memoryRecords",
): Promise<BoundedCount>;
async function countTable(ctx: QueryCtx, table: "people"): Promise<BoundedCount>;
async function countTable(
  ctx: QueryCtx,
  table: "pushSubscriptions",
): Promise<BoundedCount>;
async function countTable(
  ctx: QueryCtx,
  table: "seniorAccessSessions",
): Promise<BoundedCount>;
async function countTable(
  ctx: QueryCtx,
  table:
    | "circles"
    | "seniorProfiles"
    | "routineSchedules"
    | "memoryRecords"
    | "people"
    | "pushSubscriptions"
    | "seniorAccessSessions",
) {
  const rows = await ctx.db.query(table).take(DEFAULT_CAP + 1);
  return boundedCount(rows.length);
}

async function productOverview(ctx: QueryCtx) {
  const [
    circleCount,
    seniorProfileRows,
    routineCount,
    memoryRows,
    peopleCount,
    sessionRows,
  ] = await Promise.all([
    countTable(ctx, "circles"),
    ctx.db.query("seniorProfiles").take(DEFAULT_CAP + 1),
    countTable(ctx, "routineSchedules"),
    ctx.db.query("memoryRecords").take(DEFAULT_CAP + 1),
    countTable(ctx, "people"),
    ctx.db.query("seniorAccessSessions").take(DEFAULT_CAP + 1),
  ]);

  const seniorProfileCount = boundedCount(seniorProfileRows.length);
  const memoryCount = boundedCount(memoryRows.length);

  return {
    circleCount,
    seniorProfileCount,
    seniorModeMix: countBy(seniorProfileRows.slice(0, DEFAULT_CAP).map((row) => row.seniorMode)),
    seniorAccessStatusMix: countBy(
      seniorProfileRows.slice(0, DEFAULT_CAP).map((row) => row.accessStatus),
    ),
    sessionCount: boundedCount(sessionRows.length),
    sessionTypeMix: countBy(sessionRows.slice(0, DEFAULT_CAP).map((row) => row.sessionType)),
    activeSessionCount: boundedCount(
      sessionRows.filter((row) => row.revokedAt === null && row.expiresAt > Date.now()).length,
      DEFAULT_CAP,
    ),
    routineCount,
    memoryCount,
    memoryTypeMix: countBy(memoryRows.slice(0, DEFAULT_CAP).map((row) => row.recordType)),
    peopleCount,
    dataScope: "bounded_read_models" as const,
  };
}

async function growthOverview(ctx: QueryCtx) {
  const activeRows = await ctx.db
    .query("waitlistEntries")
    .withIndex("by_status_and_createdAt", (index) =>
      index.eq("status", "active"),
    )
    .order("desc")
    .take(DEFAULT_CAP + 1);
  const now = Date.now();
  const recentRows = activeRows.filter((row) => now - row.createdAt <= 7 * DAY_MS);

  return {
    waitlistTotal: boundedCount(activeRows.length),
    recent7DayTotal: boundedCount(recentRows.length, DEFAULT_CAP),
    sourcePathMix: countBy(
      activeRows.slice(0, DEFAULT_CAP).map((row) => row.sourcePath || "/waitlist"),
    ),
    referrerDomainMix: countBy(
      activeRows.slice(0, DEFAULT_CAP).map((row) => domainFromReferrer(row.referrer)),
    ),
    recentEntries: activeRows.slice(0, 12).map((row) => ({
      id: row._id,
      email: redactEmailForHq(row.email),
      sourcePath: row.sourcePath,
      referrerDomain: domainFromReferrer(row.referrer),
      createdAt: row.createdAt,
      status: row.status,
    })),
    analyticsProvider: null as string | null,
  };
}

async function operationsOverview(ctx: QueryCtx) {
  const [queued, sent, failed, skipped, subscriptions, sessions, pins] =
    await Promise.all([
      ctx.db
        .query("notificationDeliveries")
        .withIndex("by_status_and_scheduledFor", (index) =>
          index.eq("status", "queued"),
        )
        .take(RECENT_CAP + 1),
      ctx.db
        .query("notificationDeliveries")
        .withIndex("by_status_and_scheduledFor", (index) =>
          index.eq("status", "sent"),
        )
        .take(RECENT_CAP + 1),
      ctx.db
        .query("notificationDeliveries")
        .withIndex("by_status_and_scheduledFor", (index) =>
          index.eq("status", "failed"),
        )
        .take(RECENT_CAP + 1),
      ctx.db
        .query("notificationDeliveries")
        .withIndex("by_status_and_scheduledFor", (index) =>
          index.eq("status", "skipped"),
        )
        .take(RECENT_CAP + 1),
      ctx.db.query("pushSubscriptions").take(DEFAULT_CAP + 1),
      ctx.db.query("seniorAccessSessions").take(DEFAULT_CAP + 1),
      ctx.db.query("assistedDevicePins").take(RECENT_CAP + 1),
    ]);

  return {
    notificationDeliveryStatusMix: {
      queued: boundedCount(queued.length, RECENT_CAP),
      sent: boundedCount(sent.length, RECENT_CAP),
      failed: boundedCount(failed.length, RECENT_CAP),
      skipped: boundedCount(skipped.length, RECENT_CAP),
    },
    recentNotificationFailures: failed.slice(0, 10).map((row) => ({
      id: row._id,
      circleLabel: redactIdLabel("Circle", row.circleId),
      notificationType: row.notificationType,
      scheduledFor: row.scheduledFor,
      updatedAt: row.updatedAt,
      errorCode: row.lastError ? "redacted_error_present" : null,
    })),
    pushSubscriptionCount: boundedCount(subscriptions.length),
    activePushSubscriptionCount: boundedCount(
      subscriptions.filter((row) => row.revokedAt === null).length,
    ),
    pushPermissionMix: countBy(subscriptions.slice(0, DEFAULT_CAP).map((row) => row.permissionState)),
    seniorSessionCount: boundedCount(sessions.length),
    seniorSessionStatusMix: {
      active: sessions.filter((row) => row.revokedAt === null && row.expiresAt > Date.now()).length,
      expired: sessions.filter((row) => row.revokedAt === null && row.expiresAt <= Date.now()).length,
      revoked: sessions.filter((row) => row.revokedAt !== null).length,
    },
    pairingPinStatusMix: {
      open: pins.filter((row) => row.consumedAt === null && row.revokedAt === null && row.expiresAt > Date.now()).length,
      consumed: pins.filter((row) => row.consumedAt !== null).length,
      expired: pins.filter((row) => row.consumedAt === null && row.expiresAt <= Date.now()).length,
      revoked: pins.filter((row) => row.revokedAt !== null).length,
    },
  };
}

async function trustSafetyOverview(ctx: QueryCtx) {
  const [queuedInsights, reviewedInsights, dismissedInsights, queuedAlerts, reviewedAlerts, dismissedAlerts] =
    await Promise.all([
      ctx.db.query("insights").withIndex("by_status_and_createdAt", (index) => index.eq("status", "queued")).order("asc").take(RECENT_CAP + 1),
      ctx.db.query("insights").withIndex("by_status_and_createdAt", (index) => index.eq("status", "reviewed")).take(RECENT_CAP + 1),
      ctx.db.query("insights").withIndex("by_status_and_createdAt", (index) => index.eq("status", "dismissed")).take(RECENT_CAP + 1),
      ctx.db.query("alerts").withIndex("by_status_and_createdAt", (index) => index.eq("status", "queued")).order("asc").take(RECENT_CAP + 1),
      ctx.db.query("alerts").withIndex("by_status_and_createdAt", (index) => index.eq("status", "reviewed")).take(RECENT_CAP + 1),
      ctx.db.query("alerts").withIndex("by_status_and_createdAt", (index) => index.eq("status", "dismissed")).take(RECENT_CAP + 1),
    ]);

  const queuedItems = [
    ...queuedInsights.map((row) => ({
      kind: "Insight" as const,
      id: row._id,
      type: row.insightType,
      priority: row.priority,
      createdAt: row.createdAt,
      status: row.status,
    })),
    ...queuedAlerts.map((row) => ({
      kind: "Alert" as const,
      id: row._id,
      type: mapAlertTypeForHq(row.alertType),
      priority: row.priority,
      createdAt: row.createdAt,
      status: row.status,
    })),
  ].sort((left, right) => left.createdAt - right.createdAt);

  return {
    insightStatusMix: {
      queued: boundedCount(queuedInsights.length, RECENT_CAP),
      reviewed: boundedCount(reviewedInsights.length, RECENT_CAP),
      dismissed: boundedCount(dismissedInsights.length, RECENT_CAP),
    },
    alertStatusMix: {
      queued: boundedCount(queuedAlerts.length, RECENT_CAP),
      reviewed: boundedCount(reviewedAlerts.length, RECENT_CAP),
      dismissed: boundedCount(dismissedAlerts.length, RECENT_CAP),
    },
    priorityMix: countBy(queuedItems.map((row) => row.priority)),
    oldestQueuedAt: queuedItems[0]?.createdAt ?? null,
    recentQueue: queuedItems.slice(0, 12).map((row) => ({
      id: row.id,
      itemLabel: redactIdLabel(row.kind, row.id),
      kind: row.kind,
      type: row.type,
      priority: row.priority,
      status: row.status,
      createdAt: row.createdAt,
    })),
    evidencePolicy: "hidden_by_default" as const,
  };
}

async function voiceAiOverview(ctx: QueryCtx) {
  const [pending, processed] = await Promise.all([
    ctx.db
      .query("voiceInteractions")
      .withIndex("by_aiInsightStatus_and_createdAt", (index) =>
        index.eq("aiInsightStatus", "pending"),
      )
      .order("desc")
      .take(RECENT_CAP + 1),
    ctx.db
      .query("voiceInteractions")
      .withIndex("by_aiInsightStatus_and_createdAt", (index) =>
        index.eq("aiInsightStatus", "processed"),
      )
      .order("desc")
      .take(RECENT_CAP + 1),
  ]);
  const rows = [...pending, ...processed].sort((left, right) => right.createdAt - left.createdAt);

  return {
    interactionCount: boundedCount(rows.length, RECENT_CAP * 2),
    aiInsightStatusMix: {
      pending: boundedCount(pending.length, RECENT_CAP),
      processed: boundedCount(processed.length, RECENT_CAP),
    },
    intentTypeMix: countBy(rows.map((row) => row.intentType)),
    distressFlagCount: rows.filter((row) => row.distressDetected).length,
    medicalBoundaryFlagCount: rows.filter((row) => row.medicalRejected).length,
    savedMemoryDraftCount: rows.filter((row) => row.savedMemoryRecordId !== null).length,
    savedRoutineDraftCount: rows.filter((row) => row.savedRoutineScheduleId !== null).length,
    unknownIntentCount: rows.filter((row) => row.intentType === "unknown").length,
    recentMetadata: rows.slice(0, 12).map((row) => ({
      id: row._id,
      circleLabel: row.circleId ? redactIdLabel("Circle", row.circleId) : "Independent User",
      seniorProfileLabel: redactIdLabel("Senior Profile", row.seniorProfileId),
      sessionType: row.sessionType,
      intentType: row.intentType,
      aiInsightStatus: row.aiInsightStatus,
      distressDetected: row.distressDetected,
      medicalBoundaryFlag: row.medicalRejected,
      createdAt: row.createdAt,
    })),
    transcriptPolicy: "hidden_by_default" as const,
  };
}

async function observabilityOverview(ctx: QueryCtx) {
  const events = await ctx.db
    .query("appEvents")
    .withIndex("by_createdAt")
    .order("desc")
    .take(RECENT_CAP + 1);

  return {
    eventCount: boundedCount(events.length, RECENT_CAP),
    severityMix: countBy(events.slice(0, RECENT_CAP).map((row) => row.severity)),
    statusMix: countBy(events.slice(0, RECENT_CAP).map((row) => row.status)),
    sourceAppMix: countBy(events.slice(0, RECENT_CAP).map((row) => row.sourceApp)),
    recentEvents: events.slice(0, 20).map((row) => ({
      id: row._id,
      eventType: row.eventType,
      sourceApp: row.sourceApp,
      sourceRoute: row.sourceRoute,
      severity: row.severity,
      status: row.status,
      messageCode: row.messageCode,
      createdAt: row.createdAt,
    })),
    externalProviders: [] as string[],
  };
}

async function qaDevOverview() {
  return {
    testMode: process.env.MEMVELLA_TEST_MODE === "1",
    testSupport: process.env.MEMVELLA_TEST_MODE === "1" ? "available_when_routes_configured" : "disabled",
    productionSafe: process.env.NODE_ENV === "production",
    guardedActions: [
      "No production reset surface",
      "No HQ impersonation",
      "No user content reveal",
      "Test utilities require MEMVELLA_TEST_MODE=1",
    ],
  };
}

export const getMissionControlSnapshot = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    const [product, growth, operations, trustSafety, voiceAi, observability, qaDev] =
      await Promise.all([
        productOverview(ctx),
        growthOverview(ctx),
        operationsOverview(ctx),
        trustSafetyOverview(ctx),
        voiceAiOverview(ctx),
        observabilityOverview(ctx),
        qaDevOverview(),
      ]);

    return {
      generatedAt: Date.now(),
      product,
      growth,
      operations,
      trustSafety,
      voiceAi,
      observability,
      qaDev,
      privacyMode: "metadata_first_redacted" as const,
    };
  },
});

export const getCompanyOverview = query({
  args: { token: v.string() },
  handler: async (_ctx, args) => {
    requireHqReadToken(args.token);
    return {
      generatedAt: Date.now(),
      source: "static_company_foundations_plus_hq_runtime" as const,
    };
  },
});

export const getProductOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    return await productOverview(ctx);
  },
});

export const listProductCircles = query({
  args: {
    token: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    const page = await ctx.db
      .query("circles")
      .order("desc")
      .paginate(args.paginationOpts);

    const rows = await Promise.all(
      page.page.map(async (circle) => {
        const [memberships, seniors, deliveries] = await Promise.all([
          ctx.db
            .query("circleMemberships")
            .withIndex("by_circleId", (index) => index.eq("circleId", circle._id))
            .take(DETAIL_CAP),
          ctx.db
            .query("seniorProfiles")
            .withIndex("by_circleId", (index) => index.eq("circleId", circle._id))
            .take(DETAIL_CAP),
          ctx.db
            .query("notificationDeliveries")
            .withIndex("by_circleId_and_status_and_scheduledFor", (index) =>
              index.eq("circleId", circle._id).eq("status", "failed"),
            )
            .take(25),
        ]);

        return {
          id: circle._id,
          label: redactIdLabel("Circle", circle._id),
          createdAt: circle._creationTime,
          timezoneConfigured: Boolean(circle.timezone),
          localeConfigured: Boolean(circle.locale),
          organiserCount: memberships.filter((row) => row.role === "organiser").length,
          memberCount: memberships.filter((row) => row.role === "member").length,
          seniorProfileCount: seniors.length,
          seniorModeMix: countBy(seniors.map((row) => row.seniorMode)),
          accessStatusMix: countBy(seniors.map((row) => row.accessStatus)),
          lastActivityAt: Math.max(
            circle._creationTime,
            ...memberships.map((row) => row.lastSeenAt ?? 0),
            ...seniors.map((row) => row.lastSessionAt ?? 0),
          ),
          recentNotificationFailureCount: deliveries.length,
        };
      }),
    );

    return {
      ...page,
      page: rows,
      privacyMode: "circle_names_hidden" as const,
    };
  },
});

async function countSeniorScopedRows(
  ctx: QueryCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  const [routines, memories, people, sessions, voiceInteractions] =
    await Promise.all([
      ctx.db
        .query("routineSchedules")
        .withIndex("by_seniorProfileId", (index) =>
          index.eq("seniorProfileId", seniorProfileId),
        )
        .take(DETAIL_CAP + 1),
      ctx.db
        .query("memoryRecords")
        .withIndex("by_seniorProfileId_and_lastEditedAt", (index) =>
          index.eq("seniorProfileId", seniorProfileId),
        )
        .take(DETAIL_CAP + 1),
      ctx.db
        .query("people")
        .withIndex("by_seniorProfileId", (index) =>
          index.eq("seniorProfileId", seniorProfileId),
        )
        .take(DETAIL_CAP + 1),
      ctx.db
        .query("seniorAccessSessions")
        .withIndex("by_seniorProfileId", (index) =>
          index.eq("seniorProfileId", seniorProfileId),
        )
        .take(DETAIL_CAP + 1),
      ctx.db
        .query("voiceInteractions")
        .withIndex("by_seniorProfileId_and_createdAt", (index) =>
          index.eq("seniorProfileId", seniorProfileId),
        )
        .order("desc")
        .take(DETAIL_CAP + 1),
    ]);

  return {
    routineCount: boundedCount(routines.length, DETAIL_CAP),
    memoryCount: boundedCount(memories.length, DETAIL_CAP),
    memoryTypeMix: countBy(memories.slice(0, DETAIL_CAP).map((row) => row.recordType)),
    peopleCount: boundedCount(people.length, DETAIL_CAP),
    sessionCount: boundedCount(sessions.length, DETAIL_CAP),
    activeSessionCount: sessions.filter((row) => row.revokedAt === null && row.expiresAt > Date.now()).length,
    voiceInteractionCount: boundedCount(voiceInteractions.length, DETAIL_CAP),
    lastVoiceInteractionAt: voiceInteractions[0]?.createdAt ?? null,
  };
}

export const getProductCircleDetail = query({
  args: {
    token: v.string(),
    circleId: v.id("circles"),
  },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    const circle = await ctx.db.get(args.circleId);
    if (!circle) {
      return null;
    }

    const [memberships, seniors, notificationSettings, pushSubscriptions, queuedInsights, queuedAlerts] =
      await Promise.all([
        ctx.db.query("circleMemberships").withIndex("by_circleId", (index) => index.eq("circleId", args.circleId)).take(DETAIL_CAP),
        ctx.db.query("seniorProfiles").withIndex("by_circleId", (index) => index.eq("circleId", args.circleId)).take(DETAIL_CAP),
        ctx.db.query("notificationSettings").withIndex("by_circleId", (index) => index.eq("circleId", args.circleId)).unique(),
        ctx.db.query("pushSubscriptions").withIndex("by_circleId", (index) => index.eq("circleId", args.circleId)).take(DETAIL_CAP + 1),
        ctx.db.query("insights").withIndex("by_circleId_and_status_and_createdAt", (index) => index.eq("circleId", args.circleId).eq("status", "queued")).take(DETAIL_CAP + 1),
        ctx.db.query("alerts").withIndex("by_circleId_and_status_and_createdAt", (index) => index.eq("circleId", args.circleId).eq("status", "queued")).take(DETAIL_CAP + 1),
      ]);

    const seniorSummaries = await Promise.all(
      seniors.map(async (senior) => ({
        id: senior._id,
        label: redactIdLabel("Senior Profile", senior._id),
        seniorMode: senior.seniorMode,
        accessStatus: senior.accessStatus,
        timezoneConfigured: Boolean(senior.timezone),
        localeConfigured: Boolean(senior.locale),
        lastSessionAt: senior.lastSessionAt ?? null,
        ...(await countSeniorScopedRows(ctx, senior._id)),
      })),
    );

    return {
      id: circle._id,
      label: redactIdLabel("Circle", circle._id),
      createdAt: circle._creationTime,
      timezoneConfigured: Boolean(circle.timezone),
      localeConfigured: Boolean(circle.locale),
      participantRoleMix: countBy(memberships.map((row) => row.role)),
      seniorProfiles: seniorSummaries,
      notificationSettings: notificationSettings
        ? {
            dailySummary: notificationSettings.dailySummary,
            urgentAlerts: notificationSettings.urgentAlerts,
            routineReminders: notificationSettings.routineReminders,
            updatedAt: notificationSettings.updatedAt,
          }
        : null,
      pushSubscriptionCount: boundedCount(pushSubscriptions.length, DETAIL_CAP),
      activePushSubscriptionCount: pushSubscriptions.filter((row) => row.revokedAt === null).length,
      queuedInsightCount: boundedCount(queuedInsights.length, DETAIL_CAP),
      queuedAlertCount: boundedCount(queuedAlerts.length, DETAIL_CAP),
      privacyMode: "names_and_raw_content_hidden" as const,
    };
  },
});

export const getGrowthOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    return await growthOverview(ctx);
  },
});

export const getResearchOverview = query({
  args: { token: v.string() },
  handler: async (_ctx, args) => {
    requireHqReadToken(args.token);
    return { generatedAt: Date.now(), source: "static_research_foundations" as const };
  },
});

export const getOperationsOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    return await operationsOverview(ctx);
  },
});

export const getTrustSafetyOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    return await trustSafetyOverview(ctx);
  },
});

export const getVoiceAiOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    return await voiceAiOverview(ctx);
  },
});

export const getObservabilityOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    return await observabilityOverview(ctx);
  },
});

export const getQaDevOverview = query({
  args: { token: v.string() },
  handler: async (_ctx, args) => {
    requireHqReadToken(args.token);
    return await qaDevOverview();
  },
});

export const getAutomationOverview = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    requireHqReadToken(args.token);
    const [queuedDeliveries, failedDeliveries, pendingAi] = await Promise.all([
      ctx.db.query("notificationDeliveries").withIndex("by_status_and_scheduledFor", (index) => index.eq("status", "queued")).take(RECENT_CAP + 1),
      ctx.db.query("notificationDeliveries").withIndex("by_status_and_scheduledFor", (index) => index.eq("status", "failed")).take(RECENT_CAP + 1),
      ctx.db.query("voiceInteractions").withIndex("by_aiInsightStatus_and_createdAt", (index) => index.eq("aiInsightStatus", "pending")).take(RECENT_CAP + 1),
    ]);

    return {
      scheduledWork: [
        {
          name: "AI Insight processor",
          source: "convex/crons.ts",
          state: "implemented",
        },
        {
          name: "Notification delivery worker",
          source: "convex/crons.ts",
          state: "implemented",
        },
        {
          name: "Routine check-in scheduler",
          source: "convex/crons.ts",
          state: "implemented",
        },
      ],
      queueSignals: {
        queuedNotificationDeliveries: boundedCount(queuedDeliveries.length, RECENT_CAP),
        failedNotificationDeliveries: boundedCount(failedDeliveries.length, RECENT_CAP),
        pendingAiInsightProcessing: boundedCount(pendingAi.length, RECENT_CAP),
      },
      productionActions: "disabled_in_hq_v1" as const,
    };
  },
});
