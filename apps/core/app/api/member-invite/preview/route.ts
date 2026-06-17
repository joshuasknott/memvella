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
    const { inviteCode } = (await request.json()) as {
      inviteCode?: string;
    };
    if (typeof inviteCode !== "string") {
      return NextResponse.json(
        { error: "A 6-digit invite code is required." },
        { status: 400 },
      );
    }

    const binding = getOrCreateDeviceBindingSeed(request);
    const convex = createConvexHttpClient();
    const result = await convex.mutation(api.circleInvites.previewMemberInviteCode, {
      inviteCode,
      requestScopeKey: buildRequestThrottleFingerprint(
        binding.seed,
        request,
        "member-invite-preview",
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
    console.error("Member invite preview failed:", error);
    return NextResponse.json(
      { error: "Memvella could not check that invite code." },
      { status: 500 },
    );
  }
}
