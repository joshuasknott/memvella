import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/convex-http";
import {
  clearIndependentOnboardingCookie,
  readIndependentOnboardingToken,
} from "@/lib/independent-auth-server";
import { getPasskeyConfig, uint8ArrayToBase64Url } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { responseJSON, sessionToken, deviceFingerprint } = (await request.json()) as {
      responseJSON: Parameters<typeof verifyRegistrationResponse>[0]["response"];
      sessionToken?: string;
      deviceFingerprint?: string;
    };
    const convex = createConvexHttpClient();
    const onboardingToken = readIndependentOnboardingToken(request);
    const passkeyContext = sessionToken && deviceFingerprint
      ? await convex.query(api.independentAccess.getIndependentPasskeyRegistrationContext, {
          sessionToken,
          deviceFingerprint,
        })
      : onboardingToken
        ? await convex.query(api.independentAccess.getIndependentOnboardingPasskeyContext, {
            onboardingToken,
          })
        : null;

    if (!passkeyContext?.activeRegistrationChallenge) {
      return NextResponse.json(
        { error: "The passkey setup request expired." },
        { status: 400 },
      );
    }

    const { origin, rpID } = getPasskeyConfig(request);
    const verification = await verifyRegistrationResponse({
      response: responseJSON,
      expectedChallenge: passkeyContext.activeRegistrationChallenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json(
        { error: "This passkey could not be verified." },
        { status: 400 },
      );
    }

    const { credential, credentialBackedUp, credentialDeviceType } =
      verification.registrationInfo;

    if (sessionToken && deviceFingerprint) {
      await convex.mutation(api.independentAccess.completeSessionPasskeyRegistration, {
        sessionToken,
        deviceFingerprint,
        challenge: passkeyContext.activeRegistrationChallenge.challenge,
        credentialId: credential.id,
        credentialPublicKey: uint8ArrayToBase64Url(credential.publicKey),
        counter: credential.counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: responseJSON.response.transports ?? [],
      });

      return NextResponse.json(
        { verified: true },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (!onboardingToken || !deviceFingerprint) {
      return NextResponse.json(
        { error: "This device is no longer ready to finish setup." },
        { status: 400 },
      );
    }

    const result = await convex.mutation(
      api.independentAccess.completeOnboardingPasskeyRegistration,
      {
        onboardingToken,
        challenge: passkeyContext.activeRegistrationChallenge.challenge,
        credentialId: credential.id,
        credentialPublicKey: uint8ArrayToBase64Url(credential.publicKey),
        counter: credential.counter,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: responseJSON.response.transports ?? [],
        deviceFingerprint,
      },
    );

    const response = NextResponse.json(
      {
        verified: true,
        sessionToken: result.sessionToken,
        seniorName: result.seniorName,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
    clearIndependentOnboardingCookie(response);

    return response;
  } catch (error) {
    console.error("Passkey registration verify failed:", error);
    return NextResponse.json(
      { error: "Unable to finish passkey setup." },
      { status: 500 },
    );
  }
}
