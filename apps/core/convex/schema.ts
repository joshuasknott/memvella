import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  familySpaces: defineTable({
    displayName: v.optional(v.string()),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
    // Deprecated compatibility field kept until a data migration removes legacy docs.
    primarySupporterAuthUserId: v.optional(v.string()),
  }).index("by_primarySupporterAuthUserId", ["primarySupporterAuthUserId"]),

  circles: defineTable({
    legacyFamilySpaceId: v.union(v.id("familySpaces"), v.null()),
    displayName: v.optional(v.string()),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
  }).index("by_legacyFamilySpaceId", ["legacyFamilySpaceId"]),

  familySpaceMemberships: defineTable({
    familySpaceId: v.id("familySpaces"),
    authIdentityToken: v.string(),
    authEmail: v.union(v.string(), v.null()),
    displayName: v.string(),
    role: v.union(
      v.literal("organiser"),
      v.literal("member"),
      v.literal("independent_senior"),
    ),
    seniorProfileId: v.union(v.id("seniorProfiles"), v.null()),
    onboardingStep: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_authIdentityToken", ["authIdentityToken"])
    .index("by_role", ["role"])
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_familySpaceId_and_authIdentityToken", [
      "familySpaceId",
      "authIdentityToken",
    ])
    .index("by_familySpaceId_and_role", ["familySpaceId", "role"])
    .index("by_familySpaceId_and_role_and_seniorProfileId", [
      "familySpaceId",
      "role",
      "seniorProfileId",
    ])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  circleMemberships: defineTable({
    circleId: v.id("circles"),
    legacyFamilySpaceMembershipId: v.union(v.id("familySpaceMemberships"), v.null()),
    authIdentityToken: v.string(),
    authEmail: v.union(v.string(), v.null()),
    displayName: v.string(),
    role: v.union(
      v.literal("organiser"),
      v.literal("member"),
      v.literal("independent_senior"),
    ),
    seniorProfileId: v.union(v.id("seniorProfiles"), v.null()),
    onboardingStep: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_circleId", ["circleId"])
    .index("by_authIdentityToken", ["authIdentityToken"])
    .index("by_circleId_and_role", ["circleId", "role"])
    .index("by_circleId_and_role_and_seniorProfileId", [
      "circleId",
      "role",
      "seniorProfileId",
    ])
    .index("by_seniorProfileId", ["seniorProfileId"])
    .index("by_legacyFamilySpaceMembershipId", ["legacyFamilySpaceMembershipId"]),

  seniorProfiles: defineTable({
    familySpaceId: v.id("familySpaces"),
    displayName: v.string(),
    seniorMode: v.union(v.literal("assisted"), v.literal("independent")),
    accessStatus: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("recovery_required"),
      v.literal("revoked"),
    ),
    // Temporary widen during the migration away from independent-only auth
    // fields living on shared senior profile records.
    recoveryEmail: v.optional(v.union(v.string(), v.null())),
    recoveryPhoneNumber: v.optional(v.union(v.string(), v.null())),
    timezone: v.union(v.string(), v.null()),
    locale: v.union(v.string(), v.null()),
    lastSessionAt: v.optional(v.number()),
  })
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_familySpaceId_and_seniorMode", ["familySpaceId", "seniorMode"]),

  independentSeniorCredentials: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    phoneNumber: v.string(),
    verifiedAt: v.number(),
  })
    .index("by_seniorProfileId", ["seniorProfileId"])
    .index("by_phoneNumber", ["phoneNumber"]),

  independentOnboardingSessions: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    membershipId: v.id("familySpaceMemberships"),
    tokenHash: v.string(),
    expiresAt: v.number(),
    consumedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  // Compatibility table kept permissive while legacy rows are migrated forward.
  supporterProfiles: defineTable(v.any())
    .index("by_authUserId", ["authUserId"])
    .index("by_familySpaceId", ["familySpaceId"]),

  assistedDevicePins: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    createdByMembershipId: v.id("familySpaceMemberships"),
    pinHash: v.string(),
    expiresAt: v.number(),
    consumedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
    failedAttempts: v.number(),
    maxAttempts: v.number(),
  })
    .index("by_pinHash", ["pinHash"])
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  familyInvites: defineTable({
    familySpaceId: v.id("familySpaces"),
    createdByMembershipId: v.id("familySpaceMemberships"),
    role: v.literal("member"),
    inviteCodeHash: v.string(),
    expiresAt: v.number(),
    consumedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
    redeemedByAuthIdentityToken: v.union(v.string(), v.null()),
    redeemedByMembershipId: v.union(v.id("familySpaceMemberships"), v.null()),
  })
    .index("by_inviteCodeHash", ["inviteCodeHash"])
    .index("by_familySpaceId_and_role", ["familySpaceId", "role"]),

  circleInviteCodes: defineTable({
    circleId: v.id("circles"),
    legacyFamilyInviteId: v.union(v.id("familyInvites"), v.null()),
    createdByCircleMembershipId: v.id("circleMemberships"),
    role: v.literal("member"),
    inviteCodeHash: v.string(),
    expiresAt: v.number(),
    consumedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
    redeemedByAuthIdentityToken: v.union(v.string(), v.null()),
    redeemedByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
  })
    .index("by_inviteCodeHash", ["inviteCodeHash"])
    .index("by_circleId_and_role", ["circleId", "role"])
    .index("by_legacyFamilyInviteId", ["legacyFamilyInviteId"]),

  seniorAccessSessions: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    sessionType: v.union(
      v.literal("assisted_device"),
      v.literal("independent_web"),
    ),
    sessionTokenHash: v.string(),
    deviceFingerprintHash: v.string(),
    issuedAt: v.number(),
    lastValidatedAt: v.number(),
    expiresAt: v.number(),
    idleExpiresAt: v.number(),
    revokedAt: v.union(v.number(), v.null()),
    revokedReason: v.union(v.string(), v.null()),
    sourcePinId: v.union(v.id("assistedDevicePins"), v.null()),
    sourceMembershipId: v.union(v.id("familySpaceMemberships"), v.null()),
    sourcePasskeyId: v.union(v.id("independentSeniorPasskeys"), v.null()),
  })
    .index("by_sessionTokenHash", ["sessionTokenHash"])
    .index("by_seniorProfileId", ["seniorProfileId"])
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_seniorProfileId_and_sessionType", [
      "seniorProfileId",
      "sessionType",
    ]),

  independentSeniorPasskeys: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    credentialId: v.string(),
    credentialPublicKey: v.string(),
    counter: v.number(),
    deviceType: v.string(),
    backedUp: v.boolean(),
    transports: v.array(v.string()),
    lastUsedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
  })
    .index("by_credentialId", ["credentialId"])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  independentSeniorRecoveryCodes: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    codeHash: v.string(),
    codeSuffix: v.string(),
    createdAt: v.number(),
    createdByMembershipId: v.union(v.id("familySpaceMemberships"), v.null()),
    createdBySource: v.union(v.literal("independent"), v.literal("organiser")),
    consumedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
  })
    .index("by_codeHash", ["codeHash"])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  seniorAuthChallenges: defineTable({
    seniorProfileId: v.id("seniorProfiles"),
    purpose: v.union(
      v.literal("passkey_registration"),
      v.literal("passkey_authentication"),
    ),
    challenge: v.string(),
    expiresAt: v.number(),
    consumedAt: v.union(v.number(), v.null()),
  })
    .index("by_challenge", ["challenge"])
    .index("by_seniorProfileId_and_purpose", ["seniorProfileId", "purpose"]),

  // Compatibility table kept permissive while legacy rows are migrated forward.
  assistedDevices: defineTable(v.any())
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_pinCode", ["pinCode"]),

  // Legacy content tables stay permissive during the widen phase so older rows
  // can coexist while new writes are anchored to FamilySpace ids.
  familyMembers: defineTable(v.any()).index("by_familySpaceId", ["familySpaceId"]),

  routines: defineTable(v.any()).index("by_familySpaceId", ["familySpaceId"]),

  routineSchedules: defineTable({
    familySpaceId: v.id("familySpaces"),
    title: v.string(),
    aiInstructions: v.union(v.string(), v.null()),
    daysOfWeek: v.array(v.number()),
    startTimeMinutes: v.number(),
    timeLabel: v.string(),
    durationMinutes: v.union(v.number(), v.null()),
    timezone: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("paused")),
    createdByMembershipId: v.id("familySpaceMemberships"),
    updatedByMembershipId: v.id("familySpaceMemberships"),
    lastEditedAt: v.number(),
  })
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_familySpaceId_and_status", ["familySpaceId", "status"])
    .index("by_familySpaceId_and_lastEditedAt", [
      "familySpaceId",
      "lastEditedAt",
    ]),

  routineOccurrences: defineTable({
    familySpaceId: v.id("familySpaces"),
    routineScheduleId: v.id("routineSchedules"),
    occurrenceDateKey: v.string(),
    startTimeMinutes: v.number(),
    timeLabel: v.string(),
    timezone: v.string(),
    status: v.union(
      v.literal("scheduled"),
      v.literal("completed"),
      v.literal("skipped"),
      v.literal("canceled"),
      v.literal("unconfirmed"),
    ),
  })
    .index("by_routineScheduleId", ["routineScheduleId"])
    .index("by_familySpaceId_status_occurrenceDateKey_startTimeMinutes", [
      "familySpaceId",
      "status",
      "occurrenceDateKey",
      "startTimeMinutes",
    ])
    .index("by_status_occurrenceDateKey_startTimeMinutes", [
      "status",
      "occurrenceDateKey",
      "startTimeMinutes",
    ]),

  routineRetreatCheckIns: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    routineOccurrenceId: v.id("routineOccurrences"),
    routineScheduleId: v.id("routineSchedules"),
    status: v.union(
      v.literal("live_prompt_ready"),
      v.literal("live_prompt_sent"),
      v.literal("confirmed"),
      v.literal("unconfirmed"),
      v.literal("canceled"),
    ),
    ignoredAt: v.number(),
    softCheckInAt: v.number(),
    promptedAt: v.union(v.number(), v.null()),
    resolvedAt: v.union(v.number(), v.null()),
    promptText: v.union(v.string(), v.null()),
    responseTranscript: v.union(v.string(), v.null()),
    voiceInteractionId: v.union(v.id("voiceInteractions"), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_routineOccurrenceId", ["routineOccurrenceId"])
    .index("by_seniorProfileId_and_status_and_softCheckInAt", [
      "seniorProfileId",
      "status",
      "softCheckInAt",
    ])
    .index("by_status_and_softCheckInAt", ["status", "softCheckInAt"]),

  memories: defineTable(v.any())
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_familySpaceId_and_mediaType", ["familySpaceId", "mediaType"]),

  memoryRecords: defineTable({
    familySpaceId: v.id("familySpaces"),
    recordType: v.union(
      v.literal("text"),
      v.literal("media"),
      v.literal("audio"),
      v.literal("voice"),
    ),
    title: v.string(),
    story: v.union(v.string(), v.null()),
    transcript: v.union(v.string(), v.null()),
    memoryDate: v.union(v.string(), v.null()),
    externalUrl: v.union(v.string(), v.null()),
    createdByMembershipId: v.id("familySpaceMemberships"),
    updatedByMembershipId: v.id("familySpaceMemberships"),
    lastEditedAt: v.number(),
  })
    .index("by_familySpaceId_and_lastEditedAt", [
      "familySpaceId",
      "lastEditedAt",
    ])
    .index("by_familySpaceId_and_recordType_and_lastEditedAt", [
      "familySpaceId",
      "recordType",
      "lastEditedAt",
    ]),

  memoryAssets: defineTable({
    familySpaceId: v.id("familySpaces"),
    memoryRecordId: v.id("memoryRecords"),
    assetType: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
    ),
    storageId: v.union(v.id("_storage"), v.null()),
    externalUrl: v.union(v.string(), v.null()),
    mimeType: v.union(v.string(), v.null()),
    fileName: v.union(v.string(), v.null()),
    sortOrder: v.number(),
  })
    .index("by_memoryRecordId_and_sortOrder", ["memoryRecordId", "sortOrder"])
    .index("by_familySpaceId", ["familySpaceId"]),

  notificationSettings: defineTable({
    familySpaceId: v.id("familySpaces"),
    dailySummary: v.boolean(),
    urgentAlerts: v.boolean(),
    routineReminders: v.boolean(),
    dailySummaryTimeMinutes: v.number(),
    updatedByMembershipId: v.id("familySpaceMemberships"),
    updatedAt: v.number(),
  })
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_dailySummary_and_familySpaceId", [
      "dailySummary",
      "familySpaceId",
    ])
    .index("by_routineReminders_and_familySpaceId", [
      "routineReminders",
      "familySpaceId",
    ]),

  pushSubscriptions: defineTable({
    familySpaceId: v.id("familySpaces"),
    membershipId: v.id("familySpaceMemberships"),
    endpoint: v.string(),
    expirationTime: v.union(v.number(), v.null()),
    p256dh: v.string(),
    auth: v.string(),
    deviceLabel: v.union(v.string(), v.null()),
    userAgent: v.union(v.string(), v.null()),
    permissionState: v.union(
      v.literal("granted"),
      v.literal("denied"),
      v.literal("prompt"),
      v.literal("unsupported"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastSeenAt: v.number(),
    lastDeliveryAt: v.union(v.number(), v.null()),
    lastFailureAt: v.union(v.number(), v.null()),
    failureCount: v.number(),
    revokedAt: v.union(v.number(), v.null()),
    revokedReason: v.union(v.string(), v.null()),
  })
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_membershipId", ["membershipId"])
    .index("by_endpoint", ["endpoint"])
    .index("by_familySpaceId_and_revokedAt", ["familySpaceId", "revokedAt"]),

  notificationDeliveries: defineTable({
    familySpaceId: v.id("familySpaces"),
    membershipId: v.id("familySpaceMemberships"),
    pushSubscriptionId: v.id("pushSubscriptions"),
    notificationType: v.union(
      v.literal("routine_reminder"),
      v.literal("urgent_alert"),
      v.literal("daily_summary"),
    ),
    dedupeKey: v.string(),
    title: v.string(),
    body: v.string(),
    deepLink: v.union(v.string(), v.null()),
    scheduledFor: v.number(),
    payloadTag: v.union(v.string(), v.null()),
    routineOccurrenceId: v.union(v.id("routineOccurrences"), v.null()),
    supporterInsightId: v.union(v.id("supporterInsights"), v.null()),
    summaryDateKey: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("queued"),
      v.literal("sent"),
      v.literal("failed"),
      v.literal("skipped"),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    dispatchedAt: v.union(v.number(), v.null()),
    lastError: v.union(v.string(), v.null()),
  })
    .index("by_dedupeKey", ["dedupeKey"])
    .index("by_status_and_scheduledFor", ["status", "scheduledFor"])
    .index("by_familySpaceId_and_status_and_scheduledFor", [
      "familySpaceId",
      "status",
      "scheduledFor",
    ]),

  waitlistEntries: defineTable({
    email: v.string(),
    sourcePath: v.string(),
    referrer: v.union(v.string(), v.null()),
    userAgent: v.union(v.string(), v.null()),
    status: v.union(v.literal("active"), v.literal("unsubscribed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status_and_createdAt", ["status", "createdAt"]),

  rateLimitWindows: defineTable({
    scopeKey: v.string(),
    actionKey: v.string(),
    windowStart: v.number(),
    hits: v.number(),
    blockedUntil: v.union(v.number(), v.null()),
    updatedAt: v.number(),
  }).index("by_scopeKey_and_actionKey", ["scopeKey", "actionKey"]),

  voiceInteractions: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    sessionType: v.union(
      v.literal("assisted_device"),
      v.literal("independent_web"),
    ),
    channel: v.union(
      v.literal("assisted_voice_loop"),
      v.literal("independent_voice_loop"),
    ),
    transcript: v.string(),
    assistantResponse: v.union(v.string(), v.null()),
    medicalRejected: v.boolean(),
    medicalMarkers: v.array(v.string()),
    distressDetected: v.boolean(),
    distressMarkers: v.array(v.string()),
    intentType: v.union(
      v.literal("conversation"),
      v.literal("memory_draft"),
      v.literal("routine_draft"),
      v.literal("medical_rejection"),
      v.literal("unknown"),
    ),
    draftTitle: v.union(v.string(), v.null()),
    draftDescription: v.union(v.string(), v.null()),
    draftDate: v.union(v.string(), v.null()),
    draftTimeLabel: v.union(v.string(), v.null()),
    draftTimeMinutes: v.union(v.number(), v.null()),
    draftDaysOfWeek: v.array(v.number()),
    draftConfirmationStatus: v.union(
      v.literal("not_applicable"),
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("rejected"),
    ),
    savedMemoryRecordId: v.union(v.id("memoryRecords"), v.null()),
    savedRoutineScheduleId: v.union(v.id("routineSchedules"), v.null()),
    aiInsightStatus: v.union(v.literal("pending"), v.literal("processed")),
    aiProcessedAt: v.union(v.number(), v.null()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_familySpaceId_and_createdAt", ["familySpaceId", "createdAt"])
    .index("by_familySpaceId_and_aiInsightStatus_and_createdAt", [
      "familySpaceId",
      "aiInsightStatus",
      "createdAt",
    ])
    .index("by_aiInsightStatus_and_createdAt", [
      "aiInsightStatus",
      "createdAt",
    ])
    .index("by_seniorProfileId_and_createdAt", ["seniorProfileId", "createdAt"]),

  supporterInsights: defineTable({
    familySpaceId: v.id("familySpaces"),
    seniorProfileId: v.id("seniorProfiles"),
    sourceVoiceInteractionId: v.union(v.id("voiceInteractions"), v.null()),
    sourceType: v.union(
      v.literal("safety_guardrail"),
      v.literal("ai_pipeline"),
    ),
    insightType: v.union(
      v.literal("distress_flag"),
      v.literal("medical_boundary"),
      v.literal("memory_theme"),
      v.literal("routine_follow_up"),
      v.literal("connection_prompt"),
      v.literal("wellness_pattern"),
    ),
    priority: v.union(v.literal("high"), v.literal("normal")),
    title: v.string(),
    summary: v.string(),
    suggestedAction: v.string(),
    evidenceTranscript: v.union(v.string(), v.null()),
    status: v.union(
      v.literal("queued"),
      v.literal("reviewed"),
      v.literal("dismissed"),
    ),
    createdAt: v.number(),
    reviewedAt: v.union(v.number(), v.null()),
    reviewedByMembershipId: v.union(v.id("familySpaceMemberships"), v.null()),
  })
    .index("by_familySpaceId_and_createdAt", ["familySpaceId", "createdAt"])
    .index("by_familySpaceId_and_status_and_createdAt", [
      "familySpaceId",
      "status",
      "createdAt",
    ])
    .index("by_sourceVoiceInteractionId", ["sourceVoiceInteractionId"]),

  voiceLogs: defineTable(v.any()).index("by_familySpaceId", ["familySpaceId"]),
});
