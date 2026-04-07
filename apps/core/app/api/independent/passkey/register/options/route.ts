import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/convex-http";
import { readIndependentOnboardingToken } from "@/lib/independent-auth-server";
import { getPasskeyConfig } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    let payload: {
      sessionToken?: string;
      deviceFingerprint?: string;
    } = {};

    try {
      payload = (await request.json()) as typeof payload;
    } catch {
      payload = {};
    }

    const convex = createConvexHttpClient();
    const onboardingToken = readIndependentOnboardingToken(request);
    const passkeyContext = payload.sessionToken && payload.deviceFingerprint
      ? await convex.query(api.independentAccess.getIndependentPasskeyRegistrationContext, {
          sessionToken: payload.sessionToken,
          deviceFingerprint: payload.deviceFingerprint,
        })
      : onboardingToken
        ? await convex.query(api.independentAccess.getIndependentOnboardingPasskeyContext, {
            onboardingToken,
          })
        : null;

    if (!passkeyContext) {
      return NextResponse.json(
        { error: "No profile is ready to create a passkey on this device." },
        { status: 400 },
      );
    }

    const { rpID, rpName } = getPasskeyConfig(request);
    const optionsJSON = await generateRegistrationOptions({
      rpID,
      rpName,
      userName: `independent-${passkeyContext.seniorProfileId}`,
      userDisplayName: passkeyContext.seniorName,
      userID: new TextEncoder().encode(passkeyContext.seniorProfileId),
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "required",
        userVerification: "required",
      },
      excludeCredentials: passkeyContext.passkeys.map((passkey) => ({
        id: passkey.credentialId,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      })),
    });

    if (payload.sessionToken && payload.deviceFingerprint) {
      await convex.mutation(api.independentAccess.storeSessionPasskeyRegistrationChallenge, {
        sessionToken: payload.sessionToken,
        deviceFingerprint: payload.deviceFingerprint,
        challenge: optionsJSON.challenge,
      });
    } else if (onboardingToken) {
      await convex.mutation(api.independentAccess.storeOnboardingPasskeyRegistrationChallenge, {
        onboardingToken,
        challenge: optionsJSON.challenge,
      });
    }

    return NextResponse.json(
      { optionsJSON },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Passkey registration options failed:", error);
    return NextResponse.json(
      { error: "Unable to prepare a passkey on this device." },
      { status: 500 },
    );
  }
}
