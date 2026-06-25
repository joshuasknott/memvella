import { NextResponse } from "next/server";
import { runMemvellaTestSupportQuery } from "@/lib/test-support-server";
import { isMemvellaTestModeAvailable } from "@/lib/test-mode";

export const runtime = "nodejs";

export async function GET() {
  if (!isMemvellaTestModeAvailable()) {
    return NextResponse.json(
      { ready: false, error: "Memvella test mode is disabled." },
      { status: 404 },
    );
  }

  try {
    const result = await runMemvellaTestSupportQuery<{
      ready: boolean;
      timestamp: number;
    }>("testSupport:healthcheck");

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Memvella test healthcheck failed:", error);
    return NextResponse.json(
      { ready: false, error: "Memvella test support is not ready." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
