import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";

const siteUrl =
  process.env.BETTER_AUTH_URL ??
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL!;
const secret = process.env.BETTER_AUTH_SECRET!;

function normalizeOrigin(value: string | undefined | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function parseTrustedOriginsEnv() {
  return (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "")
    .split(",")
    .map((value) => normalizeOrigin(value.trim()))
    .filter((value): value is string => value !== null);
}

function getDefaultLocalDevelopmentOrigins() {
  return [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    "https://127.0.0.1:3000",
  ]
    .map((value) => normalizeOrigin(value))
    .filter((value): value is string => value !== null);
}

function isLocalDevelopmentOrigin(origin: string) {
  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "::1" ||
      hostname.endsWith(".local")
    ) {
      return true;
    }

    if (hostname.startsWith("10.") || hostname.startsWith("192.168.")) {
      return true;
    }

    const match = hostname.match(/^172\.(\d{1,3})\./);
    if (!match) {
      return false;
    }

    const subnet = Number(match[1]);
    return subnet >= 16 && subnet <= 31;
  } catch {
    return false;
  }
}

function resolveTrustedOrigins(request?: Request) {
  const configuredOrigins = [
    normalizeOrigin(siteUrl),
    normalizeOrigin(process.env.BETTER_AUTH_URL),
    normalizeOrigin(process.env.SITE_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    ...parseTrustedOriginsEnv(),
  ].filter((value): value is string => value !== null);

  if (!request) {
    return Array.from(new Set(configuredOrigins));
  }

  const requestOrigins = [
    normalizeOrigin(request.headers.get("origin")),
    normalizeOrigin(request.headers.get("referer")),
    normalizeOrigin(request.url),
  ].filter(
    (value): value is string => value !== null && isLocalDevelopmentOrigin(value),
  );

  if (requestOrigins.length === 0) {
    return Array.from(new Set(configuredOrigins));
  }

  return Array.from(
    new Set([
      ...configuredOrigins,
      ...getDefaultLocalDevelopmentOrigins(),
      ...requestOrigins,
    ]),
  );
}

function shouldDisableBetterAuthOriginCheck() {
  return false;
}

export const authComponent = createClient<DataModel>(components.betterAuth);

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    secret,
    database: authComponent.adapter(ctx),
    trustedOrigins: (request) => resolveTrustedOrigins(request),
    advanced: {
      disableOriginCheck: shouldDisableBetterAuthOriginCheck(),
    },
    emailAndPassword: {
      enabled: true,
        requireEmailVerification: true,
    },
    plugins: [convex({ authConfig })],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
