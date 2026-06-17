type AuthEnv = Record<string, string | undefined>;

function readNonBlankEnv(env: AuthEnv, name: string) {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

export function resolveBetterAuthSiteUrl(env: AuthEnv = process.env) {
  const value =
    readNonBlankEnv(env, "BETTER_AUTH_URL") ??
    readNonBlankEnv(env, "SITE_URL") ??
    readNonBlankEnv(env, "NEXT_PUBLIC_SITE_URL");

  if (!value) {
    throw new Error(
      "Better Auth URL is not configured. Set BETTER_AUTH_URL or NEXT_PUBLIC_SITE_URL.",
    );
  }

  return value;
}

export function resolveBetterAuthSecret(env: AuthEnv = process.env) {
  const value = readNonBlankEnv(env, "BETTER_AUTH_SECRET");
  if (!value) {
    throw new Error("Better Auth secret is not configured. Set BETTER_AUTH_SECRET.");
  }

  return value;
}

export function resolveTrustedOriginsEnv(env: AuthEnv = process.env) {
  return readNonBlankEnv(env, "BETTER_AUTH_TRUSTED_ORIGINS") ?? "";
}
