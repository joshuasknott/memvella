import { NextRequest, NextResponse } from "next/server";
import { ensureMemvellaTestRequest } from "@/lib/test-support-server";

export const runtime = "nodejs";

type TestAuthMode = "sign-up" | "sign-in" | "sign-out";

const TEST_AUTH_ROUTE_BY_MODE: Record<TestAuthMode, string> = {
  "sign-in": "/api/auth/sign-in/email",
  "sign-out": "/api/auth/sign-out",
  "sign-up": "/api/auth/sign-up/email",
};

function isTestAuthMode(value: unknown): value is TestAuthMode {
  return value === "sign-up" || value === "sign-in" || value === "sign-out";
}

export async function POST(request: NextRequest) {
  try {
    ensureMemvellaTestRequest(request);

    const body = (await request.json()) as {
      mode?: unknown;
      [key: string]: unknown;
    };
    if (!isTestAuthMode(body.mode)) {
      return NextResponse.json(
        { error: "A valid Memvella test auth mode is required." },
        { status: 400 },
      );
    }

    const trustedOrigin =
      process.env.BETTER_AUTH_URL ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      request.nextUrl.origin;
    const authHeaders = new Headers({
      "Content-Type": "application/json",
      Origin: trustedOrigin,
      Referer: trustedOrigin,
    });
    const cookieHeader = request.headers.get("cookie");
    if (body.mode === "sign-out" && cookieHeader) {
      authHeaders.set("cookie", cookieHeader);
    }

    const authResponse = await fetch(
      new URL(TEST_AUTH_ROUTE_BY_MODE[body.mode], request.nextUrl.origin),
      {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(body).filter(([key]) => key !== "mode"),
          ),
        ),
        redirect: "manual",
      },
    );
    const payload = await authResponse.text();
    const response = new NextResponse(payload, {
      status: authResponse.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type":
          authResponse.headers.get("content-type") ?? "application/json",
      },
    });

    for (const cookie of authResponse.headers.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("Memvella test auth failed:", error);
    return NextResponse.json(
      { error: "Memvella test auth failed." },
      { status: 403 },
    );
  }
}
