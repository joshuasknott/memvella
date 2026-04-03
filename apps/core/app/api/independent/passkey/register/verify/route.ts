import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthMutation, fetchAuthQuery } from "@/lib/auth-server";
import { getPasskeyConfig, uint8ArrayToBase64Url } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { responseJSON } = (await request.json()) as {
      responseJSON: Parameters<typeof verifyRegistrationResponse>[0]["response"];
    };
    const passkeyContext = await fetchAuthQuery(
      api.independentAuth.getCurrentIndependentSeniorPasskeyContext,
    );

    if (!passkeyContext?.activeRegistrationChallenge) {
      return NextResponse.json(
        { error: "The Face ID / Touch ID setup request expired." },
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
        { error: "Face ID / Touch ID verification was not accepted." },
        { status: 400 },
      );
    }

    const { credential, credentialBackedUp, credentialDeviceType } =
      verification.registrationInfo;

    await fetchAuthMutation(api.independentAuth.saveCurrentIndependentSeniorPasskey, {
      challenge: passkeyContext.activeRegistrationChallenge.challenge,
      credentialId: credential.id,
      credentialPublicKey: uint8ArrayToBase64Url(credential.publicKey),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: responseJSON.response.transports ?? [],
    });

    return NextResponse.json({ verified: true });
  } catch (error) {
    console.error("Passkey registration verify failed:", error);
    return NextResponse.json(
      { error: "Unable to finish Face ID / Touch ID setup." },
      { status: 500 },
    );
  }
}
