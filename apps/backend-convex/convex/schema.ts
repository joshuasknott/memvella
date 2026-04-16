import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  circles: defineTable({
    displayName: v.optional(v.string()),
    timezone: v.optional(v.string()),
    locale: v.optional(v.string()),
  }),

  circleMemberships: defineTable({
    circleId: v.id("circles"),
    authIdentityToken: v.string(),
    authEmail: v.union(v.string(), v.null()),
    displayName: v.string(),
    role: v.union(v.literal("organiser"), v.literal("member")),
    seniorProfileId: v.union(v.id("seniorProfiles"), v.null()),
    onboardingStep: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_circleId", ["circleId"])
    .index("by_authIdentityToken", ["authIdentityToken"])
    .index("by_circleId_and_authIdentityToken", ["circleId", "authIdentityToken"])
    .index("by_circleId_and_role", ["circleId", "role"])
    .index("by_circleId_and_role_and_seniorProfileId", [
      "circleId",
      "role",
      "seniorProfileId",
    ])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  seniorProfiles: defineTable({
    circleId: v.union(v.id("circles"), v.null()),
    displayName: v.string(),
    seniorMode: v.union(v.literal("assisted"), v.literal("independent")),
    accessStatus: v.union(
      v.literal("pending"),
      v.literal("active"),
      v.literal("recovery_required"),
      v.literal("revoked"),
    ),
    timezone: v.union(v.string(), v.null()),
    locale: v.union(v.string(), v.null()),
    lastSessionAt: v.optional(v.number()),
  })
    .index("by_circleId", ["circleId"])
    .index("by_circleId_and_seniorMode", ["circleId", "seniorMode"]),

  independentOnboardingSessions: defineTable({
    seniorProfileId: v.id("seniorProfiles"),
    sourceCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    tokenHash: v.string(),
    expiresAt: v.number(),
    consumedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
  })
    .index("by_tokenHash", ["tokenHash"])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  assistedDevicePins: defineTable({
    circleId: v.id("circles"),
    seniorProfileId: v.id("seniorProfiles"),
    createdByCircleMembershipId: v.id("circleMemberships"),
    pinHash: v.string(),
    expiresAt: v.number(),
    consumedAt: v.union(v.number(), v.null()),
    revokedAt: v.union(v.number(), v.null()),
    failedAttempts: v.number(),
    maxAttempts: v.number(),
  })
    .index("by_pinHash", ["pinHash"])
    .index("by_circleId", ["circleId"])
    .index("by_seniorProfileId", ["seniorProfileId"]),

  circleInviteCodes: defineTable({
    circleId: v.id("circles"),
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
    .index("by_circleId_and_role", ["circleId", "role"]),

  seniorAccessSessions: defineTable({
    circleId: v.union(v.id("circles"), v.null()),
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
    sourceCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    sourcePasskeyId: v.union(v.id("independentSeniorPasskeys"), v.null()),
  })
    .index("by_sessionTokenHash", ["sessionTokenHash"])
    .index("by_seniorProfileId", ["seniorProfileId"])
    .index("by_circleId", ["circleId"])
    .index("by_seniorProfileId_and_sessionType", [
      "seniorProfileId",
      "sessionType",
    ]),

  independentSeniorPasskeys: defineTable({
    circleId: v.union(v.id("circles"), v.null()),
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
    circleId: v.union(v.id("circles"), v.null()),
    seniorProfileId: v.id("seniorProfiles"),
    codeHash: v.string(),
    codeSuffix: v.string(),
    createdAt: v.number(),
    createdByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
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

  people: defineTable({
    seniorProfileId: v.id("seniorProfiles"),
    name: v.string(),
    relationship: v.string(),
    isLiving: v.boolean(),
    aiContext: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    createdByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    updatedByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    lastEditedAt: v.number(),
  })
    .index("by_seniorProfileId", ["seniorProfileId"])
    .index("by_seniorProfileId_and_lastEditedAt", [
      "seniorProfileId",
      "lastEditedAt",
    ]),


  routineSchedules: defineTable({
    seniorProfileId: v.id("seniorProfiles"),
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
    createdByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    updatedByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    lastEditedAt: v.number(),
  })
    .index("by_seniorProfileId", ["seniorProfileId"])
    .index("by_seniorProfileId_and_status", ["seniorProfileId", "status"])
    .index("by_seniorProfileId_and_lastEditedAt", [
      "seniorProfileId",
      "lastEditedAt",
    ]),

  routineOccurrences: defineTable({
    seniorProfileId: v.id("seniorProfiles"),
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
    .index("by_seniorProfileId_status_occurrenceDateKey_startTimeMinutes", [
      "seniorProfileId",
      "status",
      "occurrenceDateKey",
      "startTimeMinutes",
    ])
    .index("by_status_occurrenceDateKey_startTimeMinutes", [
      "status",
      "occurrenceDateKey",
      "startTimeMinutes",
    ]),

  routineCheckIns: defineTable({
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


  memoryRecords: defineTable({
    seniorProfileId: v.id("seniorProfiles"),
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
    createdByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    updatedByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
    lastEditedAt: v.number(),
  })
    .index("by_seniorProfileId_and_lastEditedAt", [
      "seniorProfileId",
      "lastEditedAt",
    ])
    .index("by_seniorProfileId_and_recordType_and_lastEditedAt", [
      "seniorProfileId",
      "recordType",
      "lastEditedAt",
    ]),

  memoryAssets: defineTable({
    seniorProfileId: v.id("seniorProfiles"),
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
    .index("by_seniorProfileId", ["seniorProfileId"]),

  notificationSettings: defineTable({
    circleId: v.id("circles"),
    dailySummary: v.boolean(),
    urgentAlerts: v.boolean(),
    routineReminders: v.boolean(),
    dailySummaryTimeMinutes: v.number(),
    updatedByCircleMembershipId: v.id("circleMemberships"),
    updatedAt: v.number(),
  })
    .index("by_circleId", ["circleId"])
    .index("by_dailySummary_and_circleId", [
      "dailySummary",
      "circleId",
    ])
    .index("by_routineReminders_and_circleId", [
      "routineReminders",
      "circleId",
    ]),

  pushSubscriptions: defineTable({
    circleId: v.id("circles"),
    circleMembershipId: v.id("circleMemberships"),
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
    .index("by_circleId", ["circleId"])
    .index("by_circleMembershipId", ["circleMembershipId"])
    .index("by_endpoint", ["endpoint"])
    .index("by_circleId_and_revokedAt", ["circleId", "revokedAt"]),

  notificationDeliveries: defineTable({
    circleId: v.id("circles"),
    circleMembershipId: v.id("circleMemberships"),
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
    alertId: v.union(v.id("alerts"), v.null()),
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
    .index("by_circleId_and_status_and_scheduledFor", [
      "circleId",
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
    circleId: v.union(v.id("circles"), v.null()),
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
    .index("by_circleId_and_createdAt", ["circleId", "createdAt"])
    .index("by_circleId_and_aiInsightStatus_and_createdAt", [
      "circleId",
      "aiInsightStatus",
      "createdAt",
    ])
    .index("by_aiInsightStatus_and_createdAt", [
      "aiInsightStatus",
      "createdAt",
    ])
    .index("by_seniorProfileId_and_createdAt", ["seniorProfileId", "createdAt"]),

  insights: defineTable({
    circleId: v.union(v.id("circles"), v.null()),
    seniorProfileId: v.id("seniorProfiles"),
    sourceVoiceInteractionId: v.union(v.id("voiceInteractions"), v.null()),
    sourceType: v.union(
      v.literal("safety_guardrail"),
      v.literal("ai_pipeline"),
    ),
    insightType: v.union(
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
    reviewedByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
  })
    .index("by_circleId_and_createdAt", ["circleId", "createdAt"])
    .index("by_circleId_and_status_and_createdAt", [
      "circleId",
      "status",
      "createdAt",
    ])
    .index("by_sourceVoiceInteractionId", ["sourceVoiceInteractionId"]),

  alerts: defineTable({
    circleId: v.union(v.id("circles"), v.null()),
    seniorProfileId: v.id("seniorProfiles"),
    sourceVoiceInteractionId: v.union(v.id("voiceInteractions"), v.null()),
    sourceType: v.union(
      v.literal("safety_guardrail"),
      v.literal("ai_pipeline"),
    ),
    alertType: v.union(
      v.literal("distress_flag"),
      v.literal("medical_boundary"),
      v.literal("escalation"),
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
    reviewedByCircleMembershipId: v.union(v.id("circleMemberships"), v.null()),
  })
    .index("by_circleId_and_createdAt", ["circleId", "createdAt"])
    .index("by_circleId_and_status_and_createdAt", [
      "circleId",
      "status",
      "createdAt",
    ])
    .index("by_alertType_and_status_and_createdAt", [
      "alertType",
      "status",
      "createdAt",
    ])
    .index("by_sourceVoiceInteractionId", ["sourceVoiceInteractionId"]),
});
