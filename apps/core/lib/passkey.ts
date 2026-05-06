export function base64UrlToUint8Array(value: string) {
  return new Uint8Array(Buffer.from(value, "base64url"));
}

export function uint8ArrayToBase64Url(value: Uint8Array | ArrayBuffer) {
  const bytes = value instanceof ArrayBuffer ? new Uint8Array(value) : value;
  return Buffer.from(bytes).toString("base64url");
}

function normalizeOrigin(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function getRequestOrigin(request: Request) {
  const headerOrigin = normalizeOrigin(request.headers.get("origin"));
  if (headerOrigin) {
    return headerOrigin;
  }

  const refererOrigin = normalizeOrigin(request.headers.get("referer"));
  if (refererOrigin) {
    return refererOrigin;
  }

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();

  if (forwardedHost && forwardedProto) {
    const forwardedOrigin = normalizeOrigin(
      `${forwardedProto}://${forwardedHost}`,
    );
    if (forwardedOrigin) {
      return forwardedOrigin;
    }
  }

  return new URL(request.url).origin;
}

export function getPasskeyConfig(request: Request) {
  const requestOrigin = getRequestOrigin(request);
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? process.env.BETTER_AUTH_URL ?? null;
  const configuredOrigin = configuredBaseUrl
    ? normalizeOrigin(configuredBaseUrl)
    : null;

  if (process.env.NODE_ENV === "production") {
    if (!configuredOrigin) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL or BETTER_AUTH_URL must be set and valid in production.",
      );
    }

    return {
      origin: configuredOrigin,
      rpID: new URL(configuredOrigin).hostname,
      rpName: "Memvella",
    };
  }

  const origin = requestOrigin;
  const rpID = new URL(origin).hostname;

  return { origin, rpID, rpName: "Memvella" };
}
