"use client";

type PasskeyOptionsPayload = {
  error?: string;
  optionsJSON?: Record<string, unknown>;
};

type PasskeyVerificationPayload = {
  error?: string;
  sessionToken?: string;
  seniorName?: string;
};

type CompletedPasskeySignIn = {
  sessionToken: string;
  seniorName?: string;
};

export async function registerIndependentPasskey(args: {
  deviceFingerprint: string;
  sessionToken?: string;
}) {
  const optionsResponse = await fetch("/api/independent/passkey/register/options", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
    }),
  });
  const optionsPayload = (await optionsResponse.json()) as PasskeyOptionsPayload;

  if (!optionsResponse.ok || !optionsPayload.optionsJSON) {
    throw new Error(optionsPayload.error ?? "Unable to prepare a passkey on this device.");
  }

  const { startRegistration } = await import("@simplewebauthn/browser");
  const responseJSON = await startRegistration({
    optionsJSON: optionsPayload.optionsJSON as unknown as Parameters<
      typeof startRegistration
    >[0]["optionsJSON"],
  });

  const verifyResponse = await fetch("/api/independent/passkey/register/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
      responseJSON,
    }),
  });
  const verifyPayload = (await verifyResponse.json()) as PasskeyVerificationPayload;

  if (!verifyResponse.ok) {
    throw new Error(verifyPayload.error ?? "Unable to finish passkey setup.");
  }

  return verifyPayload;
}

export async function signInWithIndependentPasskey(
  deviceFingerprint: string,
): Promise<CompletedPasskeySignIn> {
  const optionsResponse = await fetch("/api/independent/passkey/authenticate/options", {
    method: "POST",
  });
  const optionsPayload = (await optionsResponse.json()) as PasskeyOptionsPayload;

  if (!optionsResponse.ok || !optionsPayload.optionsJSON) {
    throw new Error(optionsPayload.error ?? "Unable to prepare passkey sign-in.");
  }

  const { startAuthentication } = await import("@simplewebauthn/browser");
  const responseJSON = await startAuthentication({
    optionsJSON: optionsPayload.optionsJSON as unknown as Parameters<
      typeof startAuthentication
    >[0]["optionsJSON"],
  });

  const verifyResponse = await fetch("/api/independent/passkey/authenticate/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      deviceFingerprint,
      responseJSON,
    }),
  });
  const verifyPayload = (await verifyResponse.json()) as PasskeyVerificationPayload;

  if (!verifyResponse.ok || !verifyPayload.sessionToken) {
    throw new Error(verifyPayload.error ?? "Unable to finish passkey sign-in.");
  }

  return {
    sessionToken: verifyPayload.sessionToken,
    ...(verifyPayload.seniorName ? { seniorName: verifyPayload.seniorName } : {}),
  };
}
