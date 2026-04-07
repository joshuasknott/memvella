import { components } from "./_generated/api";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { getIndependentMembershipForSeniorProfile } from "./familySpaceAuth";
import { isValidE164PhoneNumber } from "../lib/phone-number";

type DbCtx = MutationCtx | QueryCtx;

async function getBetterAuthPhoneNumberByField(
  ctx: DbCtx,
  args: {
    field: "email" | "userId";
    value: string;
  },
) {
  const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
    model: "user",
    select: ["phoneNumber", "phoneNumberVerified"],
    where: [{ field: args.field, operator: "eq", value: args.value }],
  });

  if (!user || user.phoneNumberVerified === false) {
    return null;
  }

  return normalizeIndependentPhoneNumber(user.phoneNumber);
}

export function normalizeIndependentPhoneNumber(
  value: string | null | undefined,
) {
  const trimmed = value?.trim();
  return trimmed && isValidE164PhoneNumber(trimmed) ? trimmed : null;
}

export function extractIndependentPhoneNumberFromAuthEmail(
  value: string | null | undefined,
) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^independent-(\d+)@phone\.memvella\.local$/);
  if (!match) {
    return null;
  }

  return normalizeIndependentPhoneNumber(`+${match[1]}`);
}

export async function getIndependentSeniorCredential(
  ctx: DbCtx,
  seniorProfileId: Id<"seniorProfiles">,
) {
  return await ctx.db
    .query("independentSeniorCredentials")
    .withIndex("by_seniorProfileId", (query) =>
      query.eq("seniorProfileId", seniorProfileId),
    )
    .unique();
}

export async function resolveIndependentSeniorPhoneNumber(
  ctx: DbCtx,
  seniorProfile: Doc<"seniorProfiles">,
) {
  const credential = await getIndependentSeniorCredential(ctx, seniorProfile._id);
  if (credential) {
    return credential.phoneNumber;
  }

  const legacyPhoneNumber = normalizeIndependentPhoneNumber(
    seniorProfile.recoveryPhoneNumber,
  );
  if (legacyPhoneNumber) {
    return legacyPhoneNumber;
  }

  const membership = await getIndependentMembershipForSeniorProfile(
    ctx,
    seniorProfile.familySpaceId,
    seniorProfile._id,
  );

  const membershipPhoneNumber = extractIndependentPhoneNumberFromAuthEmail(
    membership?.authEmail,
  );
  if (membershipPhoneNumber) {
    return membershipPhoneNumber;
  }

  if (membership?.authEmail) {
    const betterAuthPhoneNumber = await getBetterAuthPhoneNumberByField(ctx, {
      field: "email",
      value: membership.authEmail,
    });
    if (betterAuthPhoneNumber) {
      return betterAuthPhoneNumber;
    }
  }

  if (membership?.authIdentityToken) {
    return await getBetterAuthPhoneNumberByField(ctx, {
      field: "userId",
      value: membership.authIdentityToken,
    });
  }

  return null;
}

export async function upsertIndependentSeniorCredential(
  ctx: MutationCtx,
  args: {
    familySpaceId: Id<"familySpaces">;
    seniorProfileId: Id<"seniorProfiles">;
    phoneNumber: string;
    verifiedAt?: number;
  },
) {
  const phoneNumber = normalizeIndependentPhoneNumber(args.phoneNumber);
  if (!phoneNumber) {
    throw new Error("A valid phone number is required.");
  }

  const verifiedAt = args.verifiedAt ?? Date.now();
  const existingCredential = await getIndependentSeniorCredential(
    ctx,
    args.seniorProfileId,
  );

  if (existingCredential) {
    await ctx.db.patch(existingCredential._id, {
      familySpaceId: args.familySpaceId,
      phoneNumber,
      verifiedAt,
    });

    return await ctx.db.get(existingCredential._id);
  }

  const credentialId = await ctx.db.insert("independentSeniorCredentials", {
    familySpaceId: args.familySpaceId,
    seniorProfileId: args.seniorProfileId,
    phoneNumber,
    verifiedAt,
  });

  return await ctx.db.get(credentialId);
}
