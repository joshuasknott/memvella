import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "./_generated/server";
import { issueSeniorAccessSession } from "./seniorAccessHelpers";
import { generateOpaqueToken, normalizeOptionalText } from "./security";
import { buildCircleName, MEMBER_LABEL } from "./terminology";

const DEFAULT_MEMVELLA_TEST_AUTH_TOKEN = "memvella-local-test-token";

const testSupportAuthValidator = {
  authToken: v.string(),
} as const;

const seniorExperienceValidator = v.union(
  v.literal("assisted"),
  v.literal("independent"),
);

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
  | "seniorAuthChallenges"
  | "independentSeniorRecoveryCodes"
  | "independentSeniorPasskeys"
  | "seniorAccessSessions"
  | "circleInviteCodes"
  | "assistedDevicePins"
  | "independentOnboardingSessions"
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
  "seniorAuthChallenges",
  "independentSeniorRecoveryCodes",
  "independentSeniorPasskeys",
  "seniorAccessSessions",
  "circleInviteCodes",
  "assistedDevicePins",
  "independentOnboardingSessions",
  "circleMemberships",
  "seniorProfiles",
  "rateLimitWindows",
  "waitlistEntries",
  "circles",
];

function getExpectedTestAuthToken() {
  const configuredToken = process.env.MEMVELLA_TEST_AUTH_TOKEN?.trim();
  return configuredToken && configuredToken.length > 0
    ? configuredToken
    : DEFAULT_MEMVELLA_TEST_AUTH_TOKEN;
}

export function ensureTestSupportAccess(authToken: string) {
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
    const circleId =
      experience === "assisted"
        ? await ctx.db.insert("circles", {
            displayName:
              normalizeOptionalText(args.circleName) ?? buildCircleName(seniorName),
            timezone: undefined,
            locale: undefined,
          })
        : null;

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
      sessionType:
        experience === "assisted" ? "assisted_device" : "independent_web",
      deviceFingerprint,
      sourcePinId: null,
      sourceCircleMembershipId: null,
      sourcePasskeyId: null,
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
