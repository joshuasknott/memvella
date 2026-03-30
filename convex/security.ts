const textEncoder = new TextEncoder();

export const PASSKEY_CHALLENGE_TTL_MS = 5 * 60 * 1000;

export const SENIOR_IDLE_TIMEOUT_MS = {
  assisted_device: 45 * 60 * 1000,
  independent_web: 30 * 60 * 1000,
} as const;

export const SENIOR_SESSION_TTL_MS = {
  assisted_device: 12 * 60 * 60 * 1000,
  independent_web: 7 * 24 * 60 * 60 * 1000,
} as const;

export type SeniorSessionType = keyof typeof SENIOR_IDLE_TIMEOUT_MS;

function getSecurityPepper() {
  return (
    process.env.MEMVELLA_AUTH_PEPPER ??
    process.env.BETTER_AUTH_SECRET ??
    "memvella-local-dev-pepper"
  );
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

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

export async function hashAssistedPin(pinCode: string) {
  return createNamespacedHmac("assisted-pin", pinCode);
}

export async function hashSeniorSessionToken(sessionToken: string) {
  return createNamespacedHmac("senior-session", sessionToken);
}

export async function hashDeviceFingerprint(deviceFingerprint: string) {
  return createNamespacedHmac("device-fingerprint", deviceFingerprint);
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
