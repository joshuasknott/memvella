import { v } from "convex/values";
import { internalMutation, type MutationCtx } from "./_generated/server";

type AppEventType =
  | "waitlist_submission"
  | "backend_error"
  | "route_health"
  | "notification_worker"
  | "voice_ai"
  | "test_support";

type AppEventSourceApp = "core" | "marketing" | "internal" | "backend";
type AppEventSeverity = "info" | "warning" | "error";
type AppEventStatus = "received" | "processed" | "failed" | "skipped";

type SanitizedAppEvent = {
  eventType: AppEventType;
  sourceApp: AppEventSourceApp;
  sourceRoute: string | null;
  severity: AppEventSeverity;
  status: AppEventStatus;
  messageCode: string;
  createdAt: number;
};

const MAX_ROUTE_LENGTH = 120;
const MAX_CODE_LENGTH = 80;

function trimAscii(input: string) {
  return input.trim().replace(/[^\x20-\x7e]/g, "");
}

export function sanitizeAppEventRoute(value: string | null | undefined) {
  const normalized = trimAscii(value ?? "");
  if (!normalized || normalized.includes("@")) {
    return null;
  }

  if (/token|secret|hash|password|transcript|evidence/i.test(normalized)) {
    return null;
  }

  return normalized.slice(0, MAX_ROUTE_LENGTH);
}

export function sanitizeAppEventMessageCode(value: string) {
  const normalized = trimAscii(value)
    .toLowerCase()
    .replace(/[^a-z0-9_.:-]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, MAX_CODE_LENGTH);

  return normalized || "unknown";
}

export async function insertSanitizedAppEvent(
  ctx: MutationCtx,
  event: Omit<SanitizedAppEvent, "sourceRoute" | "messageCode" | "createdAt"> & {
    sourceRoute?: string | null;
    messageCode: string;
  },
) {
  return await ctx.db.insert("appEvents", {
    eventType: event.eventType,
    sourceApp: event.sourceApp,
    sourceRoute: sanitizeAppEventRoute(event.sourceRoute),
    severity: event.severity,
    status: event.status,
    messageCode: sanitizeAppEventMessageCode(event.messageCode),
    createdAt: Date.now(),
  });
}

export const recordAppEvent = internalMutation({
  args: {
    eventType: v.union(
      v.literal("waitlist_submission"),
      v.literal("backend_error"),
      v.literal("route_health"),
      v.literal("notification_worker"),
      v.literal("voice_ai"),
      v.literal("test_support"),
    ),
    sourceApp: v.union(
      v.literal("core"),
      v.literal("marketing"),
      v.literal("internal"),
      v.literal("backend"),
    ),
    sourceRoute: v.optional(v.union(v.string(), v.null())),
    severity: v.union(
      v.literal("info"),
      v.literal("warning"),
      v.literal("error"),
    ),
    status: v.union(
      v.literal("received"),
      v.literal("processed"),
      v.literal("failed"),
      v.literal("skipped"),
    ),
    messageCode: v.string(),
  },
  handler: async (ctx, args) => {
    return await insertSanitizedAppEvent(ctx, args);
  },
});
