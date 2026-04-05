import { NextResponse } from "next/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { getPasskeyConfig } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const passkeyContext = await fetchAuthQuery(
      api.independentAuth.getCurrentIndependentSeniorPasskeyContext,
    );

    if (!passkeyContext) {
      return NextResponse.json(
        { error: "No independent profile is ready for passkeys." },
        { status: 400 },
      );
    }

    const { rpID, rpName } = getPasskeyConfig(request);
    const optionsJSON = await generateRegistrationOptions({
      rpID,
      rpName,
      userName:
        passkeyContext.recoveryPhoneNumber ??
        `independent-${passkeyContext.seniorProfileId}`,
      userDisplayName: passkeyContext.seniorName,
      userID: new TextEncoder().encode(passkeyContext.seniorProfileId),
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required",
      },
      excludeCredentials: passkeyContext.passkeys.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      })),
    });

    await fetchAuthMutation(
      api.independentAuth.storeCurrentIndependentSeniorPasskeyRegistrationChallenge,
      {
        challenge: optionsJSON.challenge,
      },
    );

    return NextResponse.json({ optionsJSON });
  } catch (error) {
    console.error("Passkey registration options failed:", error);
    return NextResponse.json(
      { error: "Unable to prepare Face ID / Touch ID on this device." },
      { status: 500 },
    );
  }
}
