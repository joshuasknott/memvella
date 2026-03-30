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

function parseTimeToMinutes(timeValue: string) {
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
  const [routines, memories] = await Promise.all([
    ctx.db
      .query("routines")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", familySpaceId),
      )
      .take(50),
    ctx.db
      .query("memories")
      .withIndex("by_familySpaceId", (query) =>
        query.eq("familySpaceId", familySpaceId),
      )
      .order("desc")
      .take(50),
  ]);

  const nextEvent =
    routines.length === 0
      ? { title: "Enjoy your day.", time: null as string | null }
      : (() => {
          const sortedRoutines = [...routines].sort(
            (left, right) =>
              parseTimeToMinutes(left.time) - parseTimeToMinutes(right.time),
          );
          const nextRoutine = sortedRoutines[0];

          return {
            title: nextRoutine.routineName,
            time: nextRoutine.time,
            frequency: nextRoutine.frequency,
          };
        })();

  const gallery = (
    await Promise.all(
      memories
        .filter((memory) => memory.storageId !== undefined)
        .slice(0, 10)
        .map(async (memory) => {
          if (!memory.storageId) {
            return null;
          }

          const imageUrl = await ctx.storage.getUrl(memory.storageId);
          if (!imageUrl) {
            return null;
          }

          return {
            id: memory._id,
            imageUrl,
            caption: memory.title,
            date: memory.date,
            mediaType: memory.mediaType,
          };
        }),
    )
  ).filter((item): item is NonNullable<typeof item> => item !== null);

  return { nextEvent, gallery };
}
