import { NextRequest, NextResponse } from "next/server";
import { api } from "@memvella/backend";
import { createConvexHttpClient } from "@/lib/convex-http";
import {
  appendDeviceBindingCookie,
  buildRequestThrottleFingerprint,
  getOrCreateDeviceBindingSeed,
} from "@/lib/server-device-binding";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { recoveryCode, deviceFingerprint } = (await request.json()) as {
      recoveryCode?: string;
      deviceFingerprint?: string;
    };

    if (typeof recoveryCode !== "string" || typeof deviceFingerprint !== "string") {
      return NextResponse.json(
        { error: "A recovery code is required to continue." },
        { status: 400 },
      );
    }

    const binding = getOrCreateDeviceBindingSeed(request);
    const convex = createConvexHttpClient();
    const result = await convex.mutation(api.independentAccess.redeemIndependentRecoveryCode, {
      recoveryCode,
      deviceFingerprint,
      throttleScopeKey: buildRequestThrottleFingerprint(
        binding.seed,
        request,
        "independent-recovery-code",
      ),
    });

    const response = NextResponse.json(result, {
      status: result.status === "rate_limited" ? 429 : result.status === "ready" ? 200 : 400,
      headers: {
        "Cache-Control": "no-store",
      },
    });

    if (binding.isNew) {
      appendDeviceBindingCookie(response, request, binding.seed);
    }

    return response;
  } catch (error) {
    console.error("Recovery code redemption failed:", error);
    return NextResponse.json(
      { error: "Memvella could not use that recovery code." },
      { status: 500 },
    );
  }
}
