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
  getNextRoutineEventForFamilySpace,
  listTodayTimelineForFamilySpace,
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
      familySpace: Doc<"familySpaces">;
      seniorProfile: Doc<"seniorProfiles">;
      session: Doc<"seniorAccessSessions">;
    }
  | {
      status: "invalid";
      reason: SeniorSessionInvalidReason;
    };

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
  if (!session) {
    return { status: "invalid", reason: "not_found" };
  }

  if (
    args.expectedSessionType &&
    session.sessionType !== args.expectedSessionType
  ) {
    return { status: "invalid", reason: "wrong_experience" };
  }

  if (session.revokedAt !== null) {
    return { status: "invalid", reason: "revoked" };
  }

  const now = Date.now();
  if (now >= session.expiresAt) {
    return { status: "invalid", reason: "expired" };
  }

  if (now >= session.idleExpiresAt) {
    return { status: "invalid", reason: "idle_timeout" };
  }

  const deviceFingerprintHash = await hashDeviceFingerprint(args.deviceFingerprint);
  if (session.deviceFingerprintHash !== deviceFingerprintHash) {
    return { status: "invalid", reason: "device_mismatch" };
  }

  const [familySpace, seniorProfile] = await Promise.all([
    ctx.db.get(session.familySpaceId),
    ctx.db.get(session.seniorProfileId),
  ]);

  if (!familySpace || !seniorProfile) {
    return { status: "invalid", reason: "not_found" };
  }

  return {
    status: "active",
    familySpace,
    seniorProfile,
    session,
  };
}

export async function issueSeniorAccessSession(
  ctx: MutationCtx,
  args: {
    familySpaceId: Id<"familySpaces">;
    seniorProfileId: Id<"seniorProfiles">;
    sessionType: SeniorSessionType;
    deviceFingerprint: string;
    sourcePinId?: Id<"assistedDevicePins"> | null;
    sourceMembershipId?: Id<"familySpaceMemberships"> | null;
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
    familySpaceId: args.familySpaceId,
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
    sourceMembershipId: args.sourceMembershipId ?? null,
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
  familySpaceId: Id<"familySpaces">,
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
    getNextRoutineEventForFamilySpace(ctx, familySpaceId),
    listTodayTimelineForFamilySpace(ctx, familySpaceId),
    ctx.db
      .query("memoryRecords")
      .withIndex("by_familySpaceId_and_lastEditedAt", (query) =>
        query.eq("familySpaceId", familySpaceId),
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

  let gallery: GalleryItem[] = (
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
