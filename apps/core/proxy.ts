import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const publicOrganiserPaths = ["/organiser/signin"];
const protectedPrefix = "/circle";

const CSRF_SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const CSRF_EXEMPT_PATHS = new Set(["/api/auth"]);

function getAllowedOrigins(): Set<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const origins = new Set<string>();

  origins.add("http://localhost:3000");

  if (siteUrl) {
    try {
      origins.add(new URL(siteUrl).origin);
    } catch {}
  }

  return origins;
}

function checkCsrf(request: NextRequest): NextResponse | null {
  if (CSRF_SAFE_METHODS.has(request.method)) {
    return null;
  }

  const { pathname } = request.nextUrl;
  if (Array.from(CSRF_EXEMPT_PATHS).some((p) => pathname.startsWith(p))) {
    return null;
  }

  const origin = request.headers.get("origin");
  if (!origin) {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return null;
    }

    return NextResponse.json({ error: "Missing Origin header" }, { status: 403 });
  }

  const allowed = getAllowedOrigins();
  if (!allowed.has(origin)) {
    return NextResponse.json({ error: "Invalid Origin" }, { status: 403 });
  }

  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    const csrfResult = checkCsrf(request);
    if (csrfResult) {
      return csrfResult;
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith(protectedPrefix)) {
    return NextResponse.next();
  }

  if (publicOrganiserPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const signInUrl = new URL("/organiser/signin", request.url);
    signInUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/circle/:path*", "/api/:path*"],
};
