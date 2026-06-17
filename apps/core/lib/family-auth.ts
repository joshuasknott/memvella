export function sanitizeFamilyNextPath(value: string | null, fallback = "/circle") {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\\")) {
    return fallback;
  }

  try {
    const resolved = new URL(trimmed, "https://memvella.local");
    if (resolved.origin !== "https://memvella.local") {
      return fallback;
    }

    return resolved.pathname + resolved.search + resolved.hash || fallback;
  } catch {
    return fallback;
  }
}

export function getAuthErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return null;
  }

  return typeof error.code === "string" ? error.code : null;
}

export function isEmailNotVerifiedError(error: unknown) {
  return getAuthErrorCode(error) === "EMAIL_NOT_VERIFIED";
}

export function buildVerifyEmailPath(email: string, nextPath: string) {
  const params = new URLSearchParams({
    email: email.trim(),
    next: sanitizeFamilyNextPath(nextPath),
  });
  return `/organiser/verify-email?${params.toString()}`;
}
