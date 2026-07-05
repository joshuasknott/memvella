import { NextRequest, NextResponse } from "next/server";
import {
  ensureMemvellaTestRequest,
  runMemvellaTestSupportMutation,
} from "@/lib/test-support-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    ensureMemvellaTestRequest(request);

    const body = (await request.json()) as { authEmail?: unknown };
    if (typeof body.authEmail !== "string" || body.authEmail.length === 0) {
      return NextResponse.json(
        { error: "An organiser email is required." },
        { status: 400 },
      );
    }

    const result = await runMemvellaTestSupportMutation<{
      alertId: string;
      insightId: string;
    }>("testAwareness:seedAwarenessReviewFixture", {
      authEmail: body.authEmail,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Memvella awareness review fixture failed:", error);
    return NextResponse.json(
      { error: "Memvella awareness review fixture failed." },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
