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
    const [testSupportResult, awarenessResult] = await Promise.all([
      runMemvellaTestSupportQuery<{
        ready: boolean;
        timestamp: number;
      }>("testSupport:healthcheck"),
      runMemvellaTestSupportQuery<{
        ready: boolean;
        timestamp: number;
      }>("testAwareness:healthcheck"),
    ]);

    return NextResponse.json(
      {
        ready: testSupportResult.ready && awarenessResult.ready,
        timestamp: Math.max(
          testSupportResult.timestamp,
          awarenessResult.timestamp,
        ),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
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
