import { NextRequest, NextResponse } from "next/server";
import { api } from "@memvella/backend";
import { fetchAuthMutation } from "@/lib/auth-server";
import { ensureMemvellaTestRequest } from "@/lib/test-support-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    ensureMemvellaTestRequest(request);

    const body = (await request.json()) as {
      inviteCode?: unknown;
    };
    if (typeof body.inviteCode !== "string") {
      return NextResponse.json(
        { error: "A member invite code is required." },
        { status: 400 },
      );
    }

    const result = await fetchAuthMutation(
      api.circleInvites.redeemMemberInviteCode,
      {
        inviteCode: body.inviteCode,
      },
    );

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Memvella test member-invite redeem failed:", error);
    return NextResponse.json(
      { error: "Memvella test member-invite redeem failed." },
      { status: 403 },
    );
  }
}
