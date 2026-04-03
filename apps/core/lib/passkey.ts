export function base64UrlToUint8Array(value: string) {
  return new Uint8Array(Buffer.from(value, "base64url"));
}

export function uint8ArrayToBase64Url(value: Uint8Array | ArrayBuffer) {
  const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value;
  return Buffer.from(bytes).toString("base64url");
}

export function getPasskeyConfig(request: Request) {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.BETTER_AUTH_URL ??
    request.url;
  const origin = new URL(configuredBaseUrl).origin;
  const rpID = new URL(origin).hostname;

  return {
    origin,
    rpID,
    rpName: "Memvella",
  };
}
