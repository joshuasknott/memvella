import { NextRequest, NextResponse } from "next/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { api } from "@memvella/backend";
import { createConvexHttpClient } from "@/lib/convex-http";
import {
  clearIndependentPasskeyChallenge,
  readIndependentPasskeyChallenge,
} from "@/lib/independent-auth-server";
import { base64UrlToUint8Array, getPasskeyConfig } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { deviceFingerprint, responseJSON } = (await request.json()) as {
      deviceFingerprint: string;
      responseJSON: Parameters<typeof verifyAuthenticationResponse>[0]["response"];
    };
    if (!deviceFingerprint) {
      return NextResponse.json(
        {
          error: "This device is not ready for passkey sign-in.",
        },
        { status: 400 },
      );
    }

    const convex = createConvexHttpClient();
    const challenge = readIndependentPasskeyChallenge(request);

    if (!challenge) {
      return NextResponse.json(
        { error: "The passkey sign-in request expired." },
        { status: 400 },
      );
    }

    const passkey = await convex.query(
      api.independentAccess.getIndependentAuthenticationCredential,
      {
        credentialId: responseJSON.id,
      },
    );

    if (!passkey) {
      return NextResponse.json(
        { error: "That passkey is no longer available." },
        { status: 400 },
      );
    }

    const { origin, rpID } = getPasskeyConfig(request);
    const verification = await verifyAuthenticationResponse({
      response: responseJSON,
      expectedChallenge: challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: passkey.credentialId,
        publicKey: base64UrlToUint8Array(passkey.credentialPublicKey),
        counter: passkey.counter,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return NextResponse.json(
        { error: "This passkey could not verify your sign-in." },
        { status: 400 },
      );
    }

    const session = await convex.mutation(
      api.independentAccess.completeDiscoverablePasskeyAuthentication,
      {
        credentialId: passkey.credentialId,
        nextCounter: verification.authenticationInfo.newCounter,
        deviceFingerprint,
      },
    );

    const response = NextResponse.json(
      {
        verified: true,
        sessionToken: session.sessionToken,
        seniorName: session.seniorName,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
    clearIndependentPasskeyChallenge(response);

    return response;
  } catch (error) {
    console.error("Passkey authentication verify failed:", error);
    return NextResponse.json(
      { error: "Unable to finish passkey sign-in." },
      { status: 500 },
    );
  }
}
