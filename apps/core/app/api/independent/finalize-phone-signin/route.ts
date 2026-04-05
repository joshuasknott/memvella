import { NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchAuthMutation } from "@/lib/auth-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { displayName, deviceFingerprint, phoneNumber } =
      (await request.json()) as {
        displayName?: string;
        deviceFingerprint?: string;
        phoneNumber?: string;
      };

    if (!deviceFingerprint || !phoneNumber) {
      return NextResponse.json(
        {
          error:
            "Both the device fingerprint and phone number are required to finish sign-in.",
        },
        { status: 400 },
      );
    }

    const result = await fetchAuthMutation(
      api.independentAuth.finalizePhoneNumberSignIn,
      {
        displayName,
        deviceFingerprint,
        phoneNumber,
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Independent phone sign-in finalization failed:", error);
    return NextResponse.json(
      { error: "Memvella could not finish your secure sign-in." },
      { status: 500 },
    );
  }
}
