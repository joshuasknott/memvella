import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  SENIOR_IDLE_TIMEOUT_MS,
  SENIOR_SESSION_TTL_MS,
  type SeniorSessionType,
  generateOpaqueToken,
  hashDeviceFingerprint,
  hashSeniorSessionToken,
} from "./security";
import {
  getNextRoutineEventForCircle,
  getNextRoutineEventForSenior,
  listTodayTimelineForCircle,
  listTodayTimelineForSenior,
} from "./routineHelpers";
import { formatMemoryDateLabel, summarizeMemory } from "./memoryHelpers";

type SessionCtx = MutationCtx | QueryCtx;

export type SeniorSessionInvalidReason =
  | "not_found"
  | "device_mismatch"
  | "expired"
  | "idle_timeout"
  | "revoked"
  | "wrong_experience";

export type SeniorSessionValidationResult =
  | {
      status: "active";
      circle: Doc<"circles"> | null;
      seniorProfile: Doc<"seniorProfiles">;
      session: Doc<"seniorAccessSessions">;
    }
  | {
      status: "invalid";
      reason: SeniorSessionInvalidReason;
    };

type SeniorSessionRecordForValidation = Pick<
  Doc<"seniorAccessSessions">,
  | "_id"
  | "sessionType"
  | "revokedAt"
  | "expiresAt"
  | "idleExpiresAt"
  | "deviceFingerprintHash"
>;

export function evaluateSeniorSessionRecord(
  args: {
    session: SeniorSessionRecordForValidation | null;
    expectedSessionType?: SeniorSessionType;
    now: number;
    deviceFingerprintHash: string;
  },
): { status: "active" } | { status: "invalid"; reason: SeniorSessionInvalidReason; sessionId: Id<"seniorAccessSessions"> | null } {
  if (!args.session) {
    return { status: "invalid", reason: "not_found", sessionId: null };
  }

  if (
    args.expectedSessionType &&
    args.session.sessionType !== args.expectedSessionType
  ) {
    return {
      status: "invalid",
      reason: "wrong_experience",
      sessionId: args.session._id,
    };
  }

  if (args.session.revokedAt !== null) {
    return { status: "invalid", reason: "revoked", sessionId: args.session._id };
  }

  if (args.now >= args.session.expiresAt) {
    return { status: "invalid", reason: "expired", sessionId: args.session._id };
  }

  if (args.now >= args.session.idleExpiresAt) {
    return {
      status: "invalid",
      reason: "idle_timeout",
      sessionId: args.session._id,
    };
  }

  if (args.session.deviceFingerprintHash !== args.deviceFingerprintHash) {
    return {
      status: "invalid",
      reason: "device_mismatch",
      sessionId: args.session._id,
    };
  }

  return { status: "active" };
}

export function getInvalidSessionRevocationReason(
  reason: SeniorSessionInvalidReason,
  sessionId: Id<"seniorAccessSessions"> | null,
) {
  if (!sessionId) {
    return null;
  }

  switch (reason) {
    case "expired":
      return "session_expired";
    case "idle_timeout":
      return "session_idle_timeout";
    case "device_mismatch":
      return "session_device_mismatch";
    case "not_found":
      return "session_context_missing";
    case "revoked":
    case "wrong_experience":
      return null;
  }
}

export async function revokeInvalidSeniorSessionIfNeeded(
  ctx: MutationCtx,
  args: {
    reason: SeniorSessionInvalidReason;
    sessionId: Id<"seniorAccessSessions"> | null;
  },
) {
  const revokedReason = getInvalidSessionRevocationReason(
    args.reason,
    args.sessionId,
  );
  if (!revokedReason || !args.sessionId) {
    return;
  }

  const session = await ctx.db.get(args.sessionId);
  if (!session || session.revokedAt !== null) {
    return;
  }

  await ctx.db.patch(args.sessionId, {
    revokedAt: Date.now(),
    revokedReason,
  });
}

async function getActiveSessionByToken(
  ctx: SessionCtx,
  sessionToken: string,
) {
  const sessionTokenHash = await hashSeniorSessionToken(sessionToken);
  return await ctx.db
    .query("seniorAccessSessions")
    .withIndex("by_sessionTokenHash", (query) =>
      query.eq("sessionTokenHash", sessionTokenHash),
    )
    .unique();
}

export async function validateSeniorSession(
  ctx: SessionCtx,
  args: {
    sessionToken: string;
    deviceFingerprint: string;
    expectedSessionType?: SeniorSessionType;
  },
): Promise<SeniorSessionValidationResult> {
  const session = await getActiveSessionByToken(ctx, args.sessionToken);
  const now = Date.now();
  const deviceFingerprintHash = await hashDeviceFingerprint(args.deviceFingerprint);
  const evaluation = evaluateSeniorSessionRecord({
    session,
    expectedSessionType: args.expectedSessionType,
    now,
    deviceFingerprintHash,
  });
  if (evaluation.status === "invalid") {
    if ("patch" in ctx.db) {
      await revokeInvalidSeniorSessionIfNeeded(ctx as MutationCtx, {
        reason: evaluation.reason,
        sessionId: evaluation.sessionId,
      });
    }

    return {
      status: "invalid",
      reason: evaluation.reason,
    };
  }

  if (!session) {
    return { status: "invalid", reason: "not_found" };
  }

  const [circle, seniorProfile] = await Promise.all([
    session.circleId ? ctx.db.get(session.circleId) : Promise.resolve(null),
    ctx.db.get(session.seniorProfileId),
  ]);

  if (!seniorProfile) {
    return { status: "invalid", reason: "not_found" };
  }

  if (seniorProfile.circleId !== session.circleId) {
    return { status: "invalid", reason: "not_found" };
  }

  const expectedSeniorMode =
    session.sessionType === "assisted_device" ? "assisted" : "independent";
  if (seniorProfile.seniorMode !== expectedSeniorMode) {
    return {
      status: "invalid",
      reason: "wrong_experience",
    };
  }

  return {
    status: "active",
    circle,
    seniorProfile,
    session,
  };
}

export async function issueSeniorAccessSession(
  ctx: MutationCtx,
  args: {
    circleId: Id<"circles"> | null;
    seniorProfileId: Id<"seniorProfiles">;
    sessionType: SeniorSessionType;
    deviceFingerprint: string;
    sourcePinId?: Id<"assistedDevicePins"> | null;
    sourceCircleMembershipId?: Id<"circleMemberships"> | null;
    sourcePasskeyId?: Id<"independentSeniorPasskeys"> | null;
  },
) {
  const now = Date.now();
  const sessionToken = generateOpaqueToken();
  const [sessionTokenHash, deviceFingerprintHash] = await Promise.all([
    hashSeniorSessionToken(sessionToken),
    hashDeviceFingerprint(args.deviceFingerprint),
  ]);

  const expiresAt = now + SENIOR_SESSION_TTL_MS[args.sessionType];
  const idleExpiresAt = Math.min(
    expiresAt,
    now + SENIOR_IDLE_TIMEOUT_MS[args.sessionType],
  );

  const sessionId = await ctx.db.insert("seniorAccessSessions", {
    circleId: args.circleId,
    seniorProfileId: args.seniorProfileId,
    sessionType: args.sessionType,
    sessionTokenHash,
    deviceFingerprintHash,
    issuedAt: now,
    lastValidatedAt: now,
    expiresAt,
    idleExpiresAt,
    revokedAt: null,
    revokedReason: null,
    sourcePinId: args.sourcePinId ?? null,
    sourceCircleMembershipId: args.sourceCircleMembershipId ?? null,
    sourcePasskeyId: args.sourcePasskeyId ?? null,
  });

  await ctx.db.patch(args.seniorProfileId, {
    lastSessionAt: now,
    accessStatus: "active",
  });

  return { sessionId, sessionToken, expiresAt, idleExpiresAt };
}

export async function revokeSeniorSessionsForProfile(
  ctx: MutationCtx,
  args: {
    seniorProfileId: Id<"seniorProfiles">;
    sessionType?: SeniorSessionType;
    reason: string;
  },
) {
  const sessions = await ctx.db
    .query("seniorAccessSessions")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", args.seniorProfileId),
    )
    .take(50);

  const revokedAt = Date.now();
  for (const session of sessions) {
    if (
      session.revokedAt === null &&
      (!args.sessionType || session.sessionType === args.sessionType)
    ) {
      await ctx.db.patch(session._id, {
        revokedAt,
        revokedReason: args.reason,
      });
    }
  }
}

export async function buildSeniorDashboard(
  ctx: QueryCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  type GalleryItem = {
    id: string;
    mediaUrl: string;
    mediaAssetType: "image" | "video";
    caption: string;
    excerpt: string;
    date: string | null;
    dateLabel: string;
    recordType: Doc<"memoryRecords">["recordType"];
  };

  const [nextRoutine, todaysTimeline, memoryRecords] = await Promise.all([
    getNextRoutineEventForSenior(ctx, seniorProfileId),
    listTodayTimelineForSenior(ctx, seniorProfileId),
    ctx.db
      .query("memoryRecords")
      .withIndex("by_seniorProfileId_and_lastEditedAt", (query) =>
        query.eq("seniorProfileId", seniorProfileId),
      )
      .order("desc")
      .take(25),
  ]);

  const nextEvent = nextRoutine
    ? {
        title: nextRoutine.title,
        time: nextRoutine.time,
        frequency: nextRoutine.frequency,
      }
    : todaysTimeline[0]
      ? {
          title: todaysTimeline[0].title,
          time: todaysTimeline[0].time,
          frequency: todaysTimeline[0].frequency,
        }
      : { title: "Enjoy your day.", time: null as string | null };

  const gallery: GalleryItem[] = (
    await Promise.all(
      memoryRecords.map(async (record) => {
        const [asset] = await ctx.db
          .query("memoryAssets")
          .withIndex("by_memoryRecordId_and_sortOrder", (query) =>
            query.eq("memoryRecordId", record._id),
          )
          .take(1);

        if (
          !asset ||
          (asset.assetType !== "image" && asset.assetType !== "video")
        ) {
          return null;
        }

        const mediaUrl = asset.storageId
          ? await ctx.storage.getUrl(asset.storageId)
          : asset.externalUrl;
        if (!mediaUrl) {
          return null;
        }

        return {
          id: record._id,
          mediaUrl,
          mediaAssetType: asset.assetType,
          caption: record.title,
          excerpt: summarizeMemory(record),
          date: record.memoryDate,
          dateLabel: formatMemoryDateLabel(record.memoryDate),
          recordType: record.recordType,
        };
      }),
    )
  ).filter((item): item is NonNullable<typeof item> => item !== null);

  return { nextEvent, gallery };
}
