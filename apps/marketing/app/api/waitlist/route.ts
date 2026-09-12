import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";
import { api } from "@memvella/backend";
import { parseWaitlistSubmission } from "@/lib/waitlist-submission";

export const runtime = "nodejs";

function getConvexUrl() {
  const convexUrl = process.env.CONVEX_URL?.trim();
  if (!convexUrl) {
    throw new Error("Missing required environment variable: CONVEX_URL");
  }

  return convexUrl;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send a valid email address as JSON." },
      { status: 400 },
    );
  }
  const submission = parseWaitlistSubmission(body);
  if (!submission.ok) {
    return NextResponse.json({ error: submission.error }, { status: 400 });
  }
  try {
    const convex = new ConvexHttpClient(getConvexUrl());
    const result = await convex.mutation(api.waitlist.joinWaitlist, {
      email: submission.email,
      sourcePath: submission.sourcePath,
      referrer: request.headers.get("referer") ?? undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    if (result.status === "rate_limited") {
      return NextResponse.json(
        {
          error:
            "The waitlist is busy right now. Please try again in a few minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil(result.retryAfterMs / 1000)),
            ),
          },
        },
      );
    }
    if (result.status === "invalid") {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Waitlist submission failed:", error);
    return NextResponse.json(
      { error: "Memvella could not save your waitlist request right now." },
      { status: 500 },
    );
  }
}
