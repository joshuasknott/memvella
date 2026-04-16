import { NextRequest, NextResponse } from "next/server";
import {
  ensureMemvellaTestRequest,
  runMemvellaTestSupportMutation,
} from "@/lib/test-support-server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    ensureMemvellaTestRequest(request);

    const result = await runMemvellaTestSupportMutation<{
      reset: boolean;
      timestamp: number;
    }>("testSupport:resetAppData");

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Memvella test reset failed:", error);
    return NextResponse.json(
      { reset: false, error: "Memvella test reset failed." },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
