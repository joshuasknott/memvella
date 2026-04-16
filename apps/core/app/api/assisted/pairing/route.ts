import { NextRequest, NextResponse } from "next/server";
import { api } from "@memvella/backend";
import { createConvexHttpClient } from "@/lib/convex-http";
import { getPairingFailureStatus } from "@/lib/pairing-rate-limit";
import {
  appendDeviceBindingCookie,
  buildDeviceFingerprint,
  buildNetworkThrottleFingerprint,
  getOrCreateDeviceBindingSeed,
} from "@/lib/server-device-binding";

export const runtime = "nodejs";

type AssistedPairingResponse =
  | {
      success: true;
      seniorName: string;
      sessionToken: string;
      deviceFingerprint: string;
      expiresAt: number;
      idleExpiresAt: number;
    }
  | {
      success: false;
      error: string;
    };

export async function POST(request: NextRequest) {
  try {
    const { pinCode } = (await request.json()) as { pinCode?: unknown };
    if (typeof pinCode !== "string" || !/^\d{6}$/.test(pinCode.trim())) {
      return NextResponse.json<AssistedPairingResponse>(
        {
          success: false,
          error: "Enter the 6-digit code from your Organiser.",
        },
        { status: 400 },
      );
    }

    const binding = getOrCreateDeviceBindingSeed(request);
    const networkScopeKey = buildNetworkThrottleFingerprint(binding.seed, request);

    const deviceFingerprint = buildDeviceFingerprint(binding.seed, "assisted");
    const convex = createConvexHttpClient();
    const result = await convex.mutation(api.kiosk.pairTabletSession, {
      pinCode: pinCode.trim(),
      deviceFingerprint,
      networkScopeKey,
    });

    const response = result.success
      ? NextResponse.json<AssistedPairingResponse>(
          {
            ...result,
            deviceFingerprint,
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          },
        )
      : NextResponse.json<AssistedPairingResponse>(result, {
          status: getPairingFailureStatus(result.error),
          headers: {
            "Cache-Control": "no-store",
          },
        });

    if (binding.isNew) {
      appendDeviceBindingCookie(response, request, binding.seed);
    }

    return response;
  } catch (error) {
    console.error("Assisted pairing failed:", error);
    return NextResponse.json<AssistedPairingResponse>(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
