import { NextRequest, NextResponse } from "next/server";
import {
  ensureMemvellaTestRequest,
  runMemvellaTestSupportMutation,
} from "@/lib/test-support-server";

export const runtime = "nodejs";

type SeniorExperience = "assisted" | "independent";

function isSeniorExperience(value: unknown): value is SeniorExperience {
  return value === "assisted" || value === "independent";
}

export async function POST(request: NextRequest) {
  try {
    ensureMemvellaTestRequest(request);

    const body = (await request.json()) as {
      experience?: unknown;
      seniorName?: unknown;
      circleName?: unknown;
    };

    if (!isSeniorExperience(body.experience)) {
      return NextResponse.json(
        { error: "A valid senior experience is required." },
        { status: 400 },
      );
    }

    const result = await runMemvellaTestSupportMutation<{
      experience: SeniorExperience;
      circleId: string | null;
      deviceFingerprint: string;
      seniorName: string;
      seniorProfileId: string;
      sessionToken: string;
    }>("testSupport:createSeniorSessionFixture", {
      experience: body.experience,
      ...(typeof body.seniorName === "string"
        ? { seniorName: body.seniorName }
        : {}),
      ...(typeof body.circleName === "string"
        ? { circleName: body.circleName }
        : {}),
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Memvella test senior-session bootstrap failed:", error);
    return NextResponse.json(
      { error: "Memvella test senior-session bootstrap failed." },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
