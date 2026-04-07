import "server-only";

import type { NextRequest, NextResponse } from "next/server";

const INDEPENDENT_ONBOARDING_COOKIE = "memvella_independent_onboarding";
const INDEPENDENT_PASSKEY_CHALLENGE_COOKIE =
  "memvella_independent_passkey_challenge";
const PASSKEY_CHALLENGE_MAX_AGE_SECONDS = 5 * 60;
const ONBOARDING_MAX_AGE_SECONDS = 15 * 60;

function isSecureRequest(request: NextRequest) {
  return (
    request.nextUrl.protocol === "https:" || process.env.NODE_ENV === "production"
  );
}

export function readIndependentOnboardingToken(request: NextRequest) {
  return request.cookies.get(INDEPENDENT_ONBOARDING_COOKIE)?.value ?? null;
}

export function appendIndependentOnboardingCookie(
  response: NextResponse,
  request: NextRequest,
  onboardingToken: string,
) {
  response.cookies.set({
    name: INDEPENDENT_ONBOARDING_COOKIE,
    value: onboardingToken,
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: ONBOARDING_MAX_AGE_SECONDS,
  });
}

export function clearIndependentOnboardingCookie(response: NextResponse) {
  response.cookies.set({
    name: INDEPENDENT_ONBOARDING_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function readIndependentPasskeyChallenge(request: NextRequest) {
  return request.cookies.get(INDEPENDENT_PASSKEY_CHALLENGE_COOKIE)?.value ?? null;
}

export function appendIndependentPasskeyChallenge(
  response: NextResponse,
  request: NextRequest,
  challenge: string,
) {
  response.cookies.set({
    name: INDEPENDENT_PASSKEY_CHALLENGE_COOKIE,
    value: challenge,
    httpOnly: true,
    sameSite: "strict",
    secure: isSecureRequest(request),
    path: "/",
    maxAge: PASSKEY_CHALLENGE_MAX_AGE_SECONDS,
  });
}

export function clearIndependentPasskeyChallenge(response: NextResponse) {
  response.cookies.set({
    name: INDEPENDENT_PASSKEY_CHALLENGE_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}
