import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { betterAuth } from "better-auth";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { query } from "./_generated/server";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import authConfig from "./auth.config";
import { isValidE164PhoneNumber } from "../lib/phone-number";

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

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function sendPhoneNumberOtpSms(data: {
  phoneNumber: string;
  code: string;
}) {
  const accountSid = getRequiredEnv("TWILIO_ACCOUNT_SID");
  const authToken = getRequiredEnv("TWILIO_AUTH_TOKEN");
  const fromPhoneNumber = getRequiredEnv("TWILIO_SMS_FROM_NUMBER");
  const authorization = btoa(`${accountSid}:${authToken}`);
  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({
        To: data.phoneNumber,
        From: fromPhoneNumber,
        Body: `Your Memvella sign-in code is ${data.code}. It expires in 5 minutes.`,
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to send SMS sign-in code: ${errorBody}`);
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
      phoneNumber({
        expiresIn: 5 * 60,
        otpLength: 6,
        allowedAttempts: 3,
        phoneNumberValidator: async (phoneNumber) =>
          isValidE164PhoneNumber(phoneNumber),
        sendOTP: async ({ phoneNumber, code }) => {
          await sendPhoneNumberOtpSms({ phoneNumber, code });
        },
        signUpOnVerification: {
          getTempEmail: (phoneNumber) =>
            `independent-${phoneNumber.replace(/\D/g, "")}@phone.memvella.local`,
          getTempName: (phoneNumber) => phoneNumber,
        },
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
