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

  familySpaceMemberships: defineTable({
    familySpaceId: v.id("familySpaces"),
    authIdentityToken: v.string(),
    authEmail: v.union(v.string(), v.null()),
    displayName: v.string(),
    role: v.union(v.literal("supporter"), v.literal("independent_senior")),
    seniorProfileId: v.union(v.id("seniorProfiles"), v.null()),
    onboardingStep: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
  })
    .index("by_authIdentityToken", ["authIdentityToken"])
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_familySpaceId_and_authIdentityToken", [
      "familySpaceId",
      "authIdentityToken",
    ])
    .index("by_familySpaceId_and_role", ["familySpaceId", "role"])
    .index("by_seniorProfileId", ["seniorProfileId"]),

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
    recoveryEmail: v.union(v.string(), v.null()),
    timezone: v.union(v.string(), v.null()),
    locale: v.union(v.string(), v.null()),
    lastSessionAt: v.optional(v.number()),
  })
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_familySpaceId_and_seniorMode", ["familySpaceId", "seniorMode"])
    .index("by_recoveryEmail", ["recoveryEmail"]),

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

  memories: defineTable(v.any())
    .index("by_familySpaceId", ["familySpaceId"])
    .index("by_familySpaceId_and_mediaType", ["familySpaceId", "mediaType"]),

  notificationSettings: defineTable(v.any()).index("by_familySpaceId", ["familySpaceId"]),

  voiceLogs: defineTable(v.any()).index("by_familySpaceId", ["familySpaceId"]),
});
