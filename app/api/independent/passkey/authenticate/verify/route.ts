import { NextResponse } from "next/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/convex-http";
import { base64UrlToUint8Array, getPasskeyConfig } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { recoveryKey, deviceFingerprint, responseJSON } =
      (await request.json()) as {
        recoveryKey: string;
        deviceFingerprint: string;
        responseJSON: Parameters<typeof verifyAuthenticationResponse>[0]["response"];
      };
    if (!recoveryKey || !deviceFingerprint) {
      return NextResponse.json(
        {
          error:
            "Both the recovery key and device fingerprint are required for passkey sign-in.",
        },
        { status: 400 },
      );
    }

    const convex = createConvexHttpClient();
    const authenticationMaterial = await convex.query(
      api.independentAuth.getPasskeyAuthenticationMaterial,
      {
        recoveryKey,
      },
    );

    if (!authenticationMaterial?.activeAuthenticationChallenge) {
      return NextResponse.json(
        { error: "The Face ID / Touch ID sign-in request expired." },
        { status: 400 },
      );
    }

    const passkey = authenticationMaterial.passkeys.find(
      (candidate) => candidate.credentialId === responseJSON.id,
    );
    if (!passkey) {
      return NextResponse.json(
        { error: "That passkey is not linked to this Circle." },
        { status: 400 },
      );
    }

    const { origin, rpID } = getPasskeyConfig(request);
    const verification = await verifyAuthenticationResponse({
      response: responseJSON,
      expectedChallenge: authenticationMaterial.activeAuthenticationChallenge.challenge,
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
        { error: "Face ID / Touch ID could not verify this sign-in." },
        { status: 400 },
      );
    }

    const session = await convex.mutation(
      api.independentAuth.completePasskeyAuthentication,
      {
        recoveryKey,
        challenge: authenticationMaterial.activeAuthenticationChallenge.challenge,
        credentialId: passkey.credentialId,
        nextCounter: verification.authenticationInfo.newCounter,
        deviceFingerprint,
      },
    );

    return NextResponse.json({
      verified: true,
      sessionToken: session.sessionToken,
      recoveryKey: session.recoveryKey,
      seniorName: session.seniorName,
    });
  } catch (error) {
    console.error("Passkey authentication verify failed:", error);
    return NextResponse.json(
      { error: "Unable to finish Face ID / Touch ID sign-in." },
      { status: 500 },
    );
  }
}
