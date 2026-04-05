"use node";

import webPush from "web-push";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { internalAction, type ActionCtx } from "./_generated/server";

type ActivePushSubscription = {
  pushSubscriptionId: Id<"pushSubscriptions">;
  membershipId: Id<"familySpaceMemberships">;
  endpoint: string;
  expirationTime: number | null;
  p256dh: string;
  auth: string;
  deviceLabel: string | null;
  userAgent: string | null;
};

type DueDelivery = {
  deliveryId: Id<"notificationDeliveries">;
  pushSubscriptionId: Id<"pushSubscriptions">;
  endpoint: string;
  expirationTime: number | null;
  p256dh: string;
  auth: string;
  title: string;
  body: string;
  deepLink: string | null;
  payloadTag: string | null;
};

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_MEMVELLA_WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.MEMVELLA_WEB_PUSH_PRIVATE_KEY;
  const subject =
    process.env.MEMVELLA_WEB_PUSH_SUBJECT ?? "mailto:support@memvella.app";

  if (!publicKey || !privateKey) {
    return false;
  }

  webPush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

function getDeliveryErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return "Push delivery failed.";
}

async function getActiveSubscriptionsForFamilySpace(
  ctx: ActionCtx,
  familySpaceId: Id<"familySpaces">,
  cache: Map<Id<"familySpaces">, ActivePushSubscription[]>,
) {
  const cached = cache.get(familySpaceId);
  if (cached) {
    return cached;
  }

  const subscriptions = (await ctx.runQuery(
    internal.notifications.listActivePushSubscriptions,
    { familySpaceId },
  )) as ActivePushSubscription[];
  cache.set(familySpaceId, subscriptions);
  return subscriptions;
}

async function deliverDueNotifications(
  ctx: ActionCtx,
) {
  const dueDeliveries = (await ctx.runQuery(
    internal.notifications.listQueuedNotificationDeliveries,
    { now: Date.now() },
  )) as DueDelivery[];

  if (dueDeliveries.length === 0) {
    return { delivered: 0, failed: 0, skipped: 0 };
  }

  const webPushReady = configureWebPush();
  let delivered = 0;
  let failed = 0;
  let skipped = 0;

  for (const delivery of dueDeliveries) {
    if (!webPushReady) {
      await ctx.runMutation(internal.notifications.markNotificationDeliveryResult, {
        deliveryId: delivery.deliveryId,
        pushSubscriptionId: delivery.pushSubscriptionId,
        status: "skipped",
        errorMessage: "Web push is not configured in this environment.",
      });
      skipped += 1;
      continue;
    }

    try {
      await webPush.sendNotification(
        {
          endpoint: delivery.endpoint,
          expirationTime: delivery.expirationTime,
          keys: {
            p256dh: delivery.p256dh,
            auth: delivery.auth,
          },
        },
        JSON.stringify({
          title: delivery.title,
          body: delivery.body,
          deepLink: delivery.deepLink,
          tag: delivery.payloadTag,
        }),
      );

      await ctx.runMutation(internal.notifications.markNotificationDeliveryResult, {
        deliveryId: delivery.deliveryId,
        pushSubscriptionId: delivery.pushSubscriptionId,
        status: "sent",
      });
      delivered += 1;
    } catch (error) {
      await ctx.runMutation(internal.notifications.markNotificationDeliveryResult, {
        deliveryId: delivery.deliveryId,
        pushSubscriptionId: delivery.pushSubscriptionId,
        status: "failed",
        errorMessage: getDeliveryErrorMessage(error),
      });
      failed += 1;
    }
  }

  return { delivered, failed, skipped };
}

export const processNotificationQueue = internalAction({
  args: {},
  handler: async (ctx) => {
    return await deliverDueNotifications(ctx);
  },
});

export const sweepRoutineReminderNotifications = internalAction({
  args: {},
  handler: async (ctx) => {
    const candidates = (await ctx.runQuery(
      internal.notifications.listRoutineReminderCandidates,
      {},
    )) as Array<{
      occurrenceId: Id<"routineOccurrences">;
      familySpaceId: Id<"familySpaces">;
      title: string;
      timeLabel: string;
      scheduledFor: number;
      minutesUntil: number;
    }>;

    const subscriptionsByFamilySpaceId = new Map<
      Id<"familySpaces">,
      ActivePushSubscription[]
    >();
    let queued = 0;

    for (const candidate of candidates) {
      const subscriptions = await getActiveSubscriptionsForFamilySpace(
        ctx,
        candidate.familySpaceId,
        subscriptionsByFamilySpaceId,
      );

      for (const subscription of subscriptions) {
        const result = await ctx.runMutation(
          internal.notifications.enqueueNotificationDelivery,
          {
            familySpaceId: candidate.familySpaceId,
            membershipId: subscription.membershipId,
            pushSubscriptionId: subscription.pushSubscriptionId,
            notificationType: "routine_reminder",
            dedupeKey: `${subscription.pushSubscriptionId}:routine:${candidate.occurrenceId}`,
            title: `${candidate.title} is coming up`,
            body:
              candidate.minutesUntil <= 1
                ? `${candidate.title} starts now at ${candidate.timeLabel}.`
                : `${candidate.title} starts in ${candidate.minutesUntil} minutes at ${candidate.timeLabel}.`,
            deepLink: "/supporter/routines",
            scheduledFor: candidate.scheduledFor,
            payloadTag: "routine-reminder",
            routineOccurrenceId: candidate.occurrenceId,
          },
        );

        if (result.created) {
          queued += 1;
        }
      }
    }

    const deliveryResult = await deliverDueNotifications(ctx);
    return { queued, ...deliveryResult };
  },
});

export const sweepDailySummaryNotifications = internalAction({
  args: {},
  handler: async (ctx) => {
    const candidates = (await ctx.runQuery(
      internal.notifications.listDailySummaryCandidates,
      {},
    )) as Array<{
      familySpaceId: Id<"familySpaces">;
      summaryDateKey: string;
      scheduledFor: number;
    }>;

    const subscriptionsByFamilySpaceId = new Map<
      Id<"familySpaces">,
      ActivePushSubscription[]
    >();
    let queued = 0;

    for (const candidate of candidates) {
      const [subscriptions, payload] = await Promise.all([
        getActiveSubscriptionsForFamilySpace(
          ctx,
          candidate.familySpaceId,
          subscriptionsByFamilySpaceId,
        ),
        ctx.runQuery(internal.notifications.getDailySummaryDigestPayload, {
          familySpaceId: candidate.familySpaceId,
        }),
      ]);

      for (const subscription of subscriptions) {
        const result = await ctx.runMutation(
          internal.notifications.enqueueNotificationDelivery,
          {
            familySpaceId: candidate.familySpaceId,
            membershipId: subscription.membershipId,
            pushSubscriptionId: subscription.pushSubscriptionId,
            notificationType: "daily_summary",
            dedupeKey: `${subscription.pushSubscriptionId}:daily:${candidate.summaryDateKey}`,
            title: payload.title,
            body: payload.body,
            deepLink: payload.deepLink,
            scheduledFor: candidate.scheduledFor,
            payloadTag: payload.payloadTag,
            summaryDateKey: candidate.summaryDateKey,
          },
        );

        if (result.created) {
          queued += 1;
        }
      }
    }

    const deliveryResult = await deliverDueNotifications(ctx);
    return { queued, ...deliveryResult };
  },
});

export const dispatchUrgentInsightNotification = internalAction({
  args: {
    insightId: v.id("supporterInsights"),
  },
  handler: async (ctx, args) => {
    const plan = await ctx.runQuery(
      internal.notifications.getUrgentInsightDispatchPlan,
      { insightId: args.insightId },
    );

    if (!plan) {
      return { queued: 0, delivered: 0, failed: 0, skipped: 0 };
    }

    let queued = 0;
    for (const subscription of plan.subscriptions) {
      const result = await ctx.runMutation(
        internal.notifications.enqueueNotificationDelivery,
        {
          familySpaceId: plan.familySpaceId,
          membershipId: subscription.membershipId,
          pushSubscriptionId: subscription.pushSubscriptionId,
          notificationType: "urgent_alert",
          dedupeKey: `${subscription.pushSubscriptionId}:urgent:${args.insightId}`,
          title: plan.title,
          body: plan.body,
          deepLink: plan.deepLink,
          scheduledFor: Date.now(),
          payloadTag: plan.payloadTag,
          supporterInsightId: args.insightId,
        },
      );

      if (result.created) {
        queued += 1;
      }
    }

    const deliveryResult = await deliverDueNotifications(ctx);
    return { queued, ...deliveryResult };
  },
});
