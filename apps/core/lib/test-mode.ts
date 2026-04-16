export const MEMVELLA_TEST_MODE_ENABLED =
  process.env.MEMVELLA_TEST_MODE === "1";

export const MEMVELLA_TEST_AUTH_TOKEN_HEADER = "x-memvella-test-auth-token";

const DEFAULT_MEMVELLA_TEST_AUTH_TOKEN = "memvella-local-test-token";

export function ensureMemvellaTestModeEnabled() {
  if (!MEMVELLA_TEST_MODE_ENABLED) {
    throw new Error("Memvella test mode is disabled.");
  }
}

export function isMemvellaClientTestMode() {
  return process.env.NEXT_PUBLIC_MEMVELLA_TEST_MODE === "1";
}

export function getMemvellaTestAuthToken() {
  const configuredToken = process.env.MEMVELLA_TEST_AUTH_TOKEN?.trim();
  return configuredToken && configuredToken.length > 0
    ? configuredToken
    : DEFAULT_MEMVELLA_TEST_AUTH_TOKEN;
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
