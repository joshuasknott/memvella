import type { Id } from "./_generated/dataModel";

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const SENIOR_IDLE_TIMEOUT_MS = {
  assisted_device: 45 * 60 * 1000,
} as const;

export const SENIOR_SESSION_TTL_MS = {
  assisted_device: 12 * 60 * 60 * 1000,
} as const;

export type SeniorSessionType = keyof typeof SENIOR_IDLE_TIMEOUT_MS;

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

function getSecurityPepper() {
  const configuredPepper =
    getTrimmedEnvValue("MEMVELLA_AUTH_PEPPER") ??
    getTrimmedEnvValue("BETTER_AUTH_SECRET");
  if (configuredPepper) {
    return configuredPepper;
  }

  if (isLocalDevelopmentRuntime()) {
    return "memvella-local-dev-pepper";
  }

  throw new Error(
    "Missing required crypto secret. Set MEMVELLA_AUTH_PEPPER or BETTER_AUTH_SECRET.",
  );
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return difference === 0;
}

type SeniorRecoveryKeyPayload = {
  version: 1;
  seniorProfileId: Id<"seniorProfiles">;
  issuedAt: number;
};

async function createNamespacedHmac(namespace: string, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(getSecurityPepper()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(`${namespace}:${value}`),
  );

  return bytesToBase64Url(new Uint8Array(signature));
}

function randomBytes(byteLength: number) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function normalizeOptionalText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function normalizeOptionalEmail(value: string | null | undefined) {
  const trimmed = value?.trim().toLowerCase();
  return trimmed ? trimmed : undefined;
}

function isPrivateHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();

  if (
    lower === "localhost" ||
    lower === "localhost.localdomain" ||
    lower.endsWith(".localhost")
  ) {
    return true;
  }

  if (lower === "0.0.0.0" || lower === "[::]" || lower === "[::1]") {
    return true;
  }

  const ipv4Match = lower.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/,
  );
  if (ipv4Match) {
    const octets = [
      Number(ipv4Match[1]),
      Number(ipv4Match[2]),
      Number(ipv4Match[3]),
      Number(ipv4Match[4]),
    ];
    if (octets.some((octet) => octet > 255)) {
      return false;
    }
    if (octets[0] === 0) return true;
    if (octets[0] === 127) return true;
    if (octets[0] === 10) return true;
    if (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) return true;
    if (octets[0] === 192 && octets[1] === 168) return true;
    if (octets[0] === 169 && octets[1] === 254) return true;
  }

  if (lower.startsWith("[") && lower.endsWith("]")) {
    const inner = lower.slice(1, -1);
    if (
      inner.startsWith("fc") ||
      inner.startsWith("fd") ||
      inner.startsWith("fe80")
    ) {
      return true;
    }
  }

  return false;
}

export function sanitizeExternalUrl(
  value: string | null | undefined,
): string | null {
  const trimmed = normalizeOptionalText(value);
  if (!trimmed) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  if (parsed.protocol !== "https:") {
    return null;
  }
  if (parsed.username || parsed.password) {
    return null;
  }
  if (isPrivateHostname(parsed.hostname)) {
    return null;
  }

  return parsed.href;
}

export function isAllowedPushEndpoint(endpoint: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(endpoint);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:") {
    return false;
  }
  if (parsed.username || parsed.password) {
    return false;
  }
  if (isPrivateHostname(parsed.hostname)) {
    return false;
  }

  return true;
}

export async function hashAssistedPin(pinCode: string) {
  return createNamespacedHmac("assisted-pin", pinCode);
}

export async function hashCircleInviteCode(inviteCode: string) {
  return createNamespacedHmac("family-invite", inviteCode);
}

export async function hashSeniorSessionToken(sessionToken: string) {
  return createNamespacedHmac("senior-session", sessionToken);
}

export async function hashDeviceFingerprint(deviceFingerprint: string) {
  return createNamespacedHmac("device-fingerprint", deviceFingerprint);
}

export async function createSeniorRecoveryKey(
  seniorProfileId: Id<"seniorProfiles">,
) {
  const payload: SeniorRecoveryKeyPayload = {
    version: 1,
    seniorProfileId,
    issuedAt: Date.now(),
  };
  const encodedPayload = bytesToBase64Url(
    textEncoder.encode(JSON.stringify(payload)),
  );
  const signature = await createNamespacedHmac(
    "senior-recovery-key",
    encodedPayload,
  );

  return `${encodedPayload}.${signature}`;
}

export async function parseSeniorRecoveryKey(recoveryKey: string) {
  const [encodedPayload, providedSignature, ...rest] = recoveryKey.split(".");
  if (!encodedPayload || !providedSignature || rest.length > 0) {
    return null;
  }

  const expectedSignature = await createNamespacedHmac(
    "senior-recovery-key",
    encodedPayload,
  );
  if (!timingSafeEqual(providedSignature, expectedSignature)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      textDecoder.decode(base64UrlToBytes(encodedPayload)),
    ) as Partial<SeniorRecoveryKeyPayload>;
    if (
      parsed.version !== 1 ||
      typeof parsed.seniorProfileId !== "string" ||
      typeof parsed.issuedAt !== "number"
    ) {
      return null;
    }

    return parsed.seniorProfileId as Id<"seniorProfiles">;
  } catch {
    return null;
  }
}

export function generateNumericCode(length = 6) {
  const bytes = randomBytes(length);
  let code = "";

  for (let index = 0; index < length; index += 1) {
    code += (bytes[index] % 10).toString();
  }

  return code;
}

export function generateOpaqueToken(byteLength = 32) {
  return bytesToBase64Url(randomBytes(byteLength));
}
