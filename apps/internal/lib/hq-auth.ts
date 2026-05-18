import crypto from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type HqRole = "founder" | "operator" | "viewer";

export type HqCapability =
  | "view_company"
  | "view_product"
  | "view_growth"
  | "view_operations"
  | "view_trust_safety"
  | "view_observability"
  | "view_qa"
  | "view_automation";

export type HqSession = {
  role: "founder";
  capabilities: HqCapability[];
  issuedAt: number;
  expiresAt: number;
};

export type HqEnvironment = "local" | "development" | "staging" | "production";

const COOKIE_NAME = "memvella_hq_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const FOUNDER_CAPABILITIES: HqCapability[] = [
  "view_company",
  "view_product",
  "view_growth",
  "view_operations",
  "view_trust_safety",
  "view_observability",
  "view_qa",
  "view_automation",
];

function base64UrlEncode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getCookieSecret() {
  return process.env.MEMVELLA_HQ_COOKIE_SECRET?.trim() ?? "";
}

function getAccessKey() {
  return process.env.MEMVELLA_HQ_ACCESS_KEY?.trim() ?? "";
}

export function getHqEnvironment(): HqEnvironment {
  const explicit = process.env.MEMVELLA_ENV?.trim().toLowerCase();
  if (
    explicit === "local" ||
    explicit === "development" ||
    explicit === "staging" ||
    explicit === "production"
  ) {
    return explicit;
  }

  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "production";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "staging";
  }

  return process.env.NODE_ENV === "development" ? "local" : "development";
}

export function getHqAccessState() {
  const enabled = process.env.MEMVELLA_HQ_ENABLED === "1";
  const missing: string[] = [];

  if (enabled && !getAccessKey()) {
    missing.push("MEMVELLA_HQ_ACCESS_KEY");
  }
  if (enabled && getCookieSecret().length < 32) {
    missing.push("MEMVELLA_HQ_COOKIE_SECRET");
  }

  return {
    enabled,
    configured: enabled && missing.length === 0,
    missing,
    environment: getHqEnvironment(),
    readOnly: true,
    testMode: process.env.MEMVELLA_TEST_MODE === "1",
  };
}

function encodeSession(session: HqSession) {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload, getCookieSecret());
  return `${payload}.${signature}`;
}

function decodeSession(cookieValue: string | undefined): HqSession | null {
  const secret = getCookieSecret();
  if (!cookieValue || secret.length < 32) {
    return null;
  }

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<HqSession>;
    if (
      parsed.role !== "founder" ||
      !Array.isArray(parsed.capabilities) ||
      typeof parsed.issuedAt !== "number" ||
      typeof parsed.expiresAt !== "number" ||
      parsed.expiresAt <= Date.now()
    ) {
      return null;
    }

    return {
      role: "founder",
      capabilities: FOUNDER_CAPABILITIES,
      issuedAt: parsed.issuedAt,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export const getHqSession = cache(async () => {
  const accessState = getHqAccessState();
  if (!accessState.configured) {
    return null;
  }

  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(COOKIE_NAME)?.value);
});

export async function requireHqSession() {
  const session = await getHqSession();
  if (!session) {
    redirect("/");
  }

  return session;
}

export async function createFounderSession(accessKey: string) {
  const accessState = getHqAccessState();
  if (!accessState.configured) {
    return { ok: false as const, error: "Memvella HQ is not enabled or configured." };
  }

  const expected = getAccessKey();
  if (!timingSafeEqual(accessKey.trim(), expected)) {
    return { ok: false as const, error: "Access key rejected." };
  }

  const now = Date.now();
  const session: HqSession = {
    role: "founder",
    capabilities: FOUNDER_CAPABILITIES,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession(session), {
    httpOnly: true,
    sameSite: "strict",
    secure: accessState.environment === "production",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return { ok: true as const };
}

export async function clearHqSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
