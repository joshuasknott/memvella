"use client";

import { MEMVELLA_TEST_AUTH_TOKEN_HEADER } from "@/lib/test-mode";

type TestAuthMode = "sign-up" | "sign-in" | "sign-out";

type WindowWithMemvellaTestAuth = Window & {
  __MEMVELLA_TEST_AUTH_TOKEN__?: string;
};

export async function performMemvellaTestAuth(
  mode: TestAuthMode,
  payload: Record<string, unknown> = {},
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const testAuthToken = (window as WindowWithMemvellaTestAuth)
    .__MEMVELLA_TEST_AUTH_TOKEN__;
  if (testAuthToken) {
    headers[MEMVELLA_TEST_AUTH_TOKEN_HEADER] = testAuthToken;
  }

  const response = await fetch("/api/test/auth", {
    method: "POST",
    headers,
    body: JSON.stringify({
      mode,
      ...payload,
    }),
  });
  const responseText = await response.text();

  let parsedBody: Record<string, unknown> | null = null;
  try {
    parsedBody = responseText
      ? (JSON.parse(responseText) as Record<string, unknown>)
      : null;
  } catch {
    parsedBody = null;
  }

  if (!response.ok) {
    throw new Error(
      (typeof parsedBody?.message === "string" && parsedBody.message) ||
        (typeof parsedBody?.error === "string" && parsedBody.error) ||
        responseText ||
        "Memvella test auth request failed.",
    );
  }

  return parsedBody;
}
