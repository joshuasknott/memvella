import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api";
import { query } from "./_generated/server";
import type { DataModel, Id } from "./_generated/dataModel";
import {
  getIndependentSeniorCredential,
  resolveIndependentSeniorPhoneNumber,
  upsertIndependentSeniorCredential,
} from "./independentSeniorCredentials";
import { getIndependentMembershipForSeniorProfile } from "./familySpaceAuth";

export const migrations = new Migrations<DataModel>(components.migrations);

export const backfillIndependentSeniorCredentials = migrations.define({
  table: "seniorProfiles",
  batchSize: 25,
  migrateOne: async (ctx, seniorProfile) => {
    if (seniorProfile.seniorMode !== "independent") {
      return;
    }

    const membership = await getIndependentMembershipForSeniorProfile(
      ctx,
      seniorProfile.familySpaceId,
      seniorProfile._id,
    );

    const existingCredential = await getIndependentSeniorCredential(
      ctx,
      seniorProfile._id,
    );
    if (existingCredential) {
      return;
    }

    const phoneNumber = await resolveIndependentSeniorPhoneNumber(ctx, seniorProfile);
    if (!phoneNumber) {
      if (membership && seniorProfile.accessStatus !== "pending") {
        await ctx.db.patch(seniorProfile._id, {
          accessStatus: "pending",
        });
      }
      return;
    }

    await upsertIndependentSeniorCredential(ctx, {
      familySpaceId: seniorProfile.familySpaceId,
      seniorProfileId: seniorProfile._id,
      phoneNumber,
      verifiedAt: seniorProfile.lastSessionAt ?? seniorProfile._creationTime,
    });
  },
});

export const removeSeniorProfileRecoveryFields = migrations.define({
  table: "seniorProfiles",
  batchSize: 50,
  migrateOne: async (ctx, seniorProfile) => {
    if (
      seniorProfile.recoveryEmail === undefined &&
      seniorProfile.recoveryPhoneNumber === undefined
    ) {
      return;
    }

    await ctx.db.patch(seniorProfile._id, {
      recoveryEmail: undefined,
      recoveryPhoneNumber: undefined,
    });
  },
});

export const runSeniorIdentityMigrations = migrations.runner([
  internal.migrations.backfillIndependentSeniorCredentials,
  internal.migrations.removeSeniorProfileRecoveryFields,
]);

export const verifySeniorProfileRecoveryFieldMigration = query({
  args: {},
  handler: async (ctx) => {
    const remainingLegacyFieldIds: Id<"seniorProfiles">[] = [];
    let independentMembershipsWithoutCredential = 0;
    const independentMembershipWithoutCredentialIds: Id<"seniorProfiles">[] = [];

    for await (const seniorProfile of ctx.db.query("seniorProfiles")) {
      if (
        seniorProfile.recoveryEmail !== undefined ||
        seniorProfile.recoveryPhoneNumber !== undefined
      ) {
        if (remainingLegacyFieldIds.length < 10) {
          remainingLegacyFieldIds.push(seniorProfile._id);
        }
      }

      if (seniorProfile.seniorMode !== "independent") {
        continue;
      }

      const membership = await getIndependentMembershipForSeniorProfile(
        ctx,
        seniorProfile.familySpaceId,
        seniorProfile._id,
      );
      if (!membership) {
        continue;
      }

      const credential = await getIndependentSeniorCredential(ctx, seniorProfile._id);
      if (!credential && seniorProfile.accessStatus !== "pending") {
        independentMembershipsWithoutCredential += 1;
        if (independentMembershipWithoutCredentialIds.length < 10) {
          independentMembershipWithoutCredentialIds.push(seniorProfile._id);
        }
      }
    }

    return {
      complete:
        remainingLegacyFieldIds.length === 0 &&
        independentMembershipsWithoutCredential === 0,
      remainingLegacyFieldIds,
      independentMembershipsWithoutCredential,
      independentMembershipWithoutCredentialIds,
    };
  },
});
