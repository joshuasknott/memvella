export const MEMVELLA_TEST_MODE_ENABLED =
  process.env.MEMVELLA_TEST_MODE === "1";

export const MEMVELLA_TEST_AUTH_TOKEN_HEADER = "x-memvella-test-auth-token";

function isProductionRuntime() {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production"
  );
}

export function ensureMemvellaTestModeEnabled() {
  if (isProductionRuntime()) {
    throw new Error("Memvella test mode is not available in production.");
  }

  if (!MEMVELLA_TEST_MODE_ENABLED) {
    throw new Error("Memvella test mode is disabled.");
  }
}

export function isMemvellaTestModeAvailable() {
  return MEMVELLA_TEST_MODE_ENABLED && !isProductionRuntime();
}

export function isMemvellaClientTestMode() {
  return process.env.NEXT_PUBLIC_MEMVELLA_TEST_MODE === "1";
}

function isLocalDevelopmentRuntime() {
  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  return nodeEnv === "development" || !nodeEnv;
}

export function getMemvellaTestAuthToken() {
  const configuredToken = process.env.MEMVELLA_TEST_AUTH_TOKEN?.trim();
  if (configuredToken && configuredToken.length > 0) {
    return configuredToken;
  }

  if (isLocalDevelopmentRuntime()) {
    return "memvella-local-test-token";
  }

  throw new Error(
    "MEMVELLA_TEST_AUTH_TOKEN must be explicitly set when test mode is enabled outside local development.",
  );
}

export function isMemvellaTestAuthTokenValid(
  candidateToken: string | null | undefined,
) {
  if (!candidateToken) {
    return false;
  }

  return candidateToken === getMemvellaTestAuthToken();
}

export function ensureMemvellaTestAuthTokenValid(
  candidateToken: string | null | undefined,
) {
  if (!isMemvellaTestAuthTokenValid(candidateToken)) {
    throw new Error("Invalid Memvella test auth token.");
  }
}
