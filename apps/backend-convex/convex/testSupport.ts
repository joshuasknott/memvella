import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { issueSeniorAccessSession } from "./seniorAccessHelpers";
import { generateOpaqueToken, normalizeOptionalText } from "./security";
import { buildCircleName, MEMBER_LABEL } from "./terminology";

const testSupportAuthValidator = {
  authToken: v.string(),
} as const;

const seniorExperienceValidator = v.literal("assisted");

type ResettableTableName =
  | "alerts"
  | "insights"
  | "voiceInteractions"
  | "notificationDeliveries"
  | "pushSubscriptions"
  | "notificationSettings"
  | "memoryAssets"
  | "memoryRecords"
  | "routineCheckIns"
  | "routineOccurrences"
  | "routineSchedules"
  | "people"
  | "seniorAccessSessions"
  | "circleInviteCodes"
  | "assistedDevicePins"
  | "circleMemberships"
  | "seniorProfiles"
  | "rateLimitWindows"
  | "waitlistEntries"
  | "circles";

const RESET_TABLES: ReadonlyArray<ResettableTableName> = [
  "alerts",
  "insights",
  "voiceInteractions",
  "notificationDeliveries",
  "pushSubscriptions",
  "notificationSettings",
  "memoryAssets",
  "memoryRecords",
  "routineCheckIns",
  "routineOccurrences",
  "routineSchedules",
  "people",
  "seniorAccessSessions",
  "circleInviteCodes",
  "assistedDevicePins",
  "circleMemberships",
  "seniorProfiles",
  "rateLimitWindows",
  "waitlistEntries",
  "circles",
];

function isLocalOrTestRuntime() {
  if (process.env.CONVEX_DEPLOYMENT) {
    return false;
  }

  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  return !nodeEnv || nodeEnv === "development" || nodeEnv === "test";
}

function isProductionRuntime() {
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  const deployment = process.env.CONVEX_DEPLOYMENT?.trim().toLowerCase();
  return nodeEnv === "production" || deployment?.startsWith("prod:");
}

function getExpectedTestAuthToken() {
  const configuredToken = process.env.MEMVELLA_TEST_AUTH_TOKEN?.trim();
  if (configuredToken && configuredToken.length > 0) {
    return configuredToken;
  }

  if (isLocalOrTestRuntime()) {
    return "memvella-local-test-token";
  }

  throw new Error(
    "MEMVELLA_TEST_AUTH_TOKEN must be explicitly set when test mode is enabled outside local development.",
  );
}

export function ensureTestSupportAccess(authToken: string) {
  if (isProductionRuntime()) {
    throw new Error("Test support is not available in production.");
  }

  if (process.env.MEMVELLA_TEST_MODE !== "1") {
    throw new Error("Test support is not available outside test mode.");
  }

  if (authToken !== getExpectedTestAuthToken()) {
    throw new Error("Invalid Memvella test auth token.");
  }
}

async function deleteTableDocumentsInBatches(
  ctx: MutationCtx,
  tableName: ResettableTableName,
  batchSize = 128,
) {
  while (true) {
    const documents = await ctx.db.query(tableName).take(batchSize);
    if (documents.length === 0) {
      return;
    }

    for (const document of documents) {
      await ctx.db.delete(document._id);
    }
  }
}

export const healthcheck = query({
  args: {
    ...testSupportAuthValidator,
  },
  handler: async (_ctx, args) => {
    ensureTestSupportAccess(args.authToken);

    return {
      ready: true,
      timestamp: Date.now(),
    };
  },
});

export const resetAppData = mutation({
  args: {
    ...testSupportAuthValidator,
  },
  handler: async (ctx, args) => {
    ensureTestSupportAccess(args.authToken);

    for (const tableName of RESET_TABLES) {
      await deleteTableDocumentsInBatches(ctx, tableName);
    }

    return {
      reset: true,
      timestamp: Date.now(),
    };
  },
});

export const createSeniorSessionFixture = mutation({
  args: {
    ...testSupportAuthValidator,
    experience: seniorExperienceValidator,
    seniorName: v.optional(v.string()),
    circleName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    ensureTestSupportAccess(args.authToken);

    const seniorName = normalizeOptionalText(args.seniorName) ?? MEMBER_LABEL;
    const experience = args.experience;
    const circleId = await ctx.db.insert("circles", {
      displayName:
        normalizeOptionalText(args.circleName) ?? buildCircleName(seniorName),
      timezone: undefined,
      locale: undefined,
    });

    const seniorProfileId = await ctx.db.insert("seniorProfiles", {
      circleId,
      displayName: seniorName,
      seniorMode: experience,
      accessStatus: "active",
      timezone: null,
      locale: null,
      lastSessionAt: undefined,
    });

    const deviceFingerprint = `memvella-test-${experience}-${generateOpaqueToken(12)}`;
    const session = await issueSeniorAccessSession(ctx, {
      circleId,
      seniorProfileId,
      sessionType: "assisted_device",
      deviceFingerprint,
      sourcePinId: null,
      sourceCircleMembershipId: null,
    });

    return {
      experience,
      circleId,
      deviceFingerprint,
      seniorName,
      seniorProfileId,
      sessionToken: session.sessionToken,
    };
  },
});
