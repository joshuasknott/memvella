import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

export type DeviceExperience = "assisted" | "independent";

const DEVICE_BINDING_COOKIE = "memvella_device_binding";
const DEVICE_BINDING_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

function getTrimmedEnvValue(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function isLocalDevelopmentRuntime() {
  if (getTrimmedEnvValue("CONVEX_DEPLOYMENT") !== null) {
    return false;
  }

  const nodeEnv = process.env.NODE_ENV?.trim().toLowerCase();
  return nodeEnv === "development" || !nodeEnv;
}

function getBindingSecret() {
  const configuredSecret =
    getTrimmedEnvValue("MEMVELLA_AUTH_PEPPER") ??
    getTrimmedEnvValue("BETTER_AUTH_SECRET");
  if (configuredSecret) {
    return configuredSecret;
  }

  if (isLocalDevelopmentRuntime()) {
    return "memvella-local-dev-pepper";
  }

  throw new Error(
    "Missing required crypto secret. Set MEMVELLA_AUTH_PEPPER or BETTER_AUTH_SECRET.",
  );
}

function toBase64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function signValue(namespace: string, value: string) {
  return toBase64Url(
    createHmac("sha256", getBindingSecret())
      .update(`${namespace}:${value}`)
      .digest(),
  );
}

export function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const [firstAddress] = forwardedFor.split(",");
    if (firstAddress?.trim()) {
      return firstAddress.trim();
    }
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "0.0.0.0";
}

export function getOrCreateDeviceBindingSeed(request: NextRequest) {
  const existingSeed = request.cookies.get(DEVICE_BINDING_COOKIE)?.value;
  if (existingSeed) {
    return { seed: existingSeed, isNew: false as const };
  }

  return {
    seed: toBase64Url(randomBytes(32)),
    isNew: true as const,
  };
}

export function appendDeviceBindingCookie(
  response: NextResponse,
  request: NextRequest,
  seed: string,
) {
  response.cookies.set({
    name: DEVICE_BINDING_COOKIE,
    value: seed,
    httpOnly: true,
    sameSite: "strict",
    secure:
      request.nextUrl.protocol === "https:" ||
      process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEVICE_BINDING_MAX_AGE_SECONDS,
  });
}

export function buildDeviceFingerprint(
  seed: string,
  experience: DeviceExperience,
) {
  return signValue("device-fingerprint", `${seed}:${experience}`);
}

export function buildRequestThrottleFingerprint(
  seed: string,
  request: NextRequest,
  namespace: string,
) {
  const userAgent = request.headers.get("user-agent") ?? "unknown-user-agent";
  const acceptLanguage =
    request.headers.get("accept-language") ?? "unknown-language";

  return signValue(
    namespace,
    `${seed}:${getClientIp(request)}:${userAgent}:${acceptLanguage}`,
  );
}

export function buildNetworkThrottleFingerprint(
  seed: string,
  request: NextRequest,
) {
  return buildRequestThrottleFingerprint(
    seed,
    request,
    "assisted-pairing-network",
  );
}

export function createPasskeyAuthProof(args: {
  credentialId: string;
  nextCounter: number;
  deviceFingerprint: string;
}) {
  const payload = JSON.stringify({
    version: 1,
    credentialId: args.credentialId,
    nextCounter: args.nextCounter,
    deviceFingerprint: args.deviceFingerprint,
    issuedAt: Date.now(),
  });
  const encodedPayload = toBase64Url(Buffer.from(payload));
  const signature = signValue("passkey-auth-proof", encodedPayload);
  return `${encodedPayload}.${signature}`;
}
