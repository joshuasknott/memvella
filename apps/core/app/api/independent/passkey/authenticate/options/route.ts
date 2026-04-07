import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { appendIndependentPasskeyChallenge } from "@/lib/independent-auth-server";
import { getPasskeyConfig } from "@/lib/passkey";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { rpID } = getPasskeyConfig(request);
    const optionsJSON = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
    });

    const response = NextResponse.json(
      { optionsJSON },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
    appendIndependentPasskeyChallenge(response, request, optionsJSON.challenge);

    return response;
  } catch (error) {
    console.error("Passkey authentication options failed:", error);
    return NextResponse.json(
      { error: "Unable to prepare passkey sign-in." },
      { status: 500 },
    );
  }
}
