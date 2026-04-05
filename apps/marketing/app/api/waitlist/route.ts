import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "../../../../core/convex/_generated/api";

export const runtime = "nodejs";

function getConvexUrl() {
  const convexUrl = process.env.CONVEX_URL?.trim();
  if (!convexUrl) {
    throw new Error("Missing required environment variable: CONVEX_URL");
  }

  return convexUrl;
}

export async function POST(request: Request) {
  try {
    const { email, sourcePath } = (await request.json()) as {
      email?: string;
      sourcePath?: string;
    };
    if (!email?.trim()) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    const convex = new ConvexHttpClient(getConvexUrl());
    const result = await convex.mutation(api.waitlist.joinWaitlist, {
      email,
      sourcePath: sourcePath?.trim() || "/waitlist",
      referrer: request.headers.get("referer") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Waitlist submission failed:", error);
    return NextResponse.json(
      { error: "Memvella could not save your waitlist request right now." },
      { status: 500 },
    );
  }
}
