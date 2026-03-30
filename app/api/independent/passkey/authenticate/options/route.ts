import { NextResponse } from "next/server";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { createConvexHttpClient } from "@/lib/convex-http";
import { getPasskeyConfig } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { seniorProfileId } = (await request.json()) as {
      seniorProfileId: string;
    };
    if (!seniorProfileId) {
      return NextResponse.json(
        { error: "A senior profile is required for passkey recovery." },
        { status: 400 },
      );
    }

    const typedSeniorProfileId = seniorProfileId as Id<"seniorProfiles">;
    const convex = createConvexHttpClient();
    const authenticationMaterial = await convex.query(
      api.independentAuth.getPasskeyAuthenticationMaterial,
      {
        seniorProfileId: typedSeniorProfileId,
      },
    );

    if (!authenticationMaterial || authenticationMaterial.passkeys.length === 0) {
      return NextResponse.json(
        { error: "No Face ID / Touch ID passkey is ready on this device." },
        { status: 400 },
      );
    }

    const { rpID } = getPasskeyConfig(request);
    const passkeys = authenticationMaterial.passkeys;
    const optionsJSON = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      allowCredentials: passkeys.map((passkey: (typeof passkeys)[number]) => ({
        id: passkey.credentialId,
        transports: passkey.transports as AuthenticatorTransportFuture[],
      })),
    });

    await convex.mutation(api.independentAuth.storePasskeyAuthenticationChallenge, {
      seniorProfileId: typedSeniorProfileId,
      challenge: optionsJSON.challenge,
    });

    return NextResponse.json({ optionsJSON });
  } catch (error) {
    console.error("Passkey authentication options failed:", error);
    return NextResponse.json(
      { error: "Unable to prepare Face ID / Touch ID sign-in." },
      { status: 500 },
    );
  }
}
