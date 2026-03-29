import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Routes that unauthenticated users are allowed to visit
const PUBLIC_CAREGIVER_PATHS = ['/caregiver/signin'];

// Prefix that requires authentication
const PROTECTED_PREFIX = '/caregiver';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only intercept /caregiver/* routes
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  // Allow public caregiver paths (signin) to pass through
  if (PUBLIC_CAREGIVER_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for a valid Better Auth session cookie (optimistic — no DB call)
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    const signInUrl = new URL('/caregiver/signin', request.url);
    // Preserve the intended destination so we can redirect back after login
    signInUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all /caregiver/* paths.
     * Exclude Next.js internals and static assets so they are never blocked.
     */
    '/caregiver/:path*',
  ],
};
