import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/convex-http";
import {
  appendIndependentOnboardingCookie,
} from "@/lib/independent-auth-server";
import {
  appendDeviceBindingCookie,
  buildRequestThrottleFingerprint,
  getOrCreateDeviceBindingSeed,
} from "@/lib/server-device-binding";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { displayName } = (await request.json()) as {
      displayName?: string;
    };
    if (typeof displayName !== "string") {
      return NextResponse.json(
        { error: "Please tell Memvella what to call you." },
        { status: 400 },
      );
    }

    const binding = getOrCreateDeviceBindingSeed(request);
    const convex = createConvexHttpClient();
    const result = await convex.mutation(api.independentAccess.beginIndependentOnboarding, {
      displayName,
      throttleScopeKey: buildRequestThrottleFingerprint(
        binding.seed,
        request,
        "independent-onboarding-start",
      ),
    });

    if (result.status !== "ready") {
      const response = NextResponse.json(
        { error: result.message },
        {
          status: result.status === "rate_limited" ? 429 : 400,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );

      if (binding.isNew) {
        appendDeviceBindingCookie(response, request, binding.seed);
      }

      return response;
    }

    const response = NextResponse.json(
      { seniorName: result.seniorName },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    appendIndependentOnboardingCookie(response, request, result.onboardingToken);
    if (binding.isNew) {
      appendDeviceBindingCookie(response, request, binding.seed);
    }

    return response;
  } catch (error) {
    console.error("Independent onboarding start failed:", error);
    return NextResponse.json(
      { error: "Memvella could not start setup on this device." },
      { status: 500 },
    );
  }
}
