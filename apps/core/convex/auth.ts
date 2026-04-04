import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins/magic-link";
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

  if (process.env.NODE_ENV === "production" || !request) {
    return Array.from(new Set(configuredOrigins));
  }

  const requestOrigins = [
    normalizeOrigin(request.headers.get("origin")),
    normalizeOrigin(request.headers.get("referer")),
    normalizeOrigin(request.url),
  ].filter(
    (value): value is string => value !== null && isLocalDevelopmentOrigin(value),
  );

  return Array.from(new Set([...configuredOrigins, ...requestOrigins]));
}

export const authComponent = createClient<DataModel>(components.betterAuth);

async function sendMagicLinkEmail(data: {
  email: string;
  url: string;
  token: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromAddress =
    process.env.RESEND_FROM_EMAIL ?? "Memvella <no-reply@memvella.local>";

  if (!resendApiKey) {
    console.info(`[Memvella sign-in link] ${data.email}: ${data.url}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [data.email],
      subject: "Your Memvella sign-in link",
      html: `
        <div style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
          <h1 style="font-size: 24px; margin-bottom: 12px;">Sign in to Memvella</h1>
          <p style="margin-bottom: 20px;">
            Tap the button below to continue to your Circle.
          </p>
          <a
            href="${data.url}"
            style="display: inline-block; background: #6B21A8; color: white; padding: 14px 24px; border-radius: 999px; text-decoration: none; font-weight: 700;"
          >
            Open Memvella
          </a>
          <p style="margin-top: 20px; font-size: 14px; color: #4b5563;">
            This link expires in 5 minutes. If you did not request it, you can ignore this email.
          </p>
        </div>
      `,
      text: `Open this sign-in link in the next 5 minutes: ${data.url}`,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send sign-in link email: ${errorBody}`);
  }
}

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    secret,
    database: authComponent.adapter(ctx),
    trustedOrigins: (request) => resolveTrustedOrigins(request),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      magicLink({
        expiresIn: 5 * 60,
        allowedAttempts: 1,
        storeToken: "hashed",
        sendMagicLink: sendMagicLinkEmail,
      }),
      convex({ authConfig }),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
