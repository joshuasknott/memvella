"use client";

export type DeviceExperience = "assisted";

function getBindingStorageKey(experience: DeviceExperience) {
  return `memvella_${experience}_device_binding`;
}

export function persistDeviceFingerprint(
  experience: DeviceExperience,
  deviceFingerprint: string,
) {
  localStorage.setItem(getBindingStorageKey(experience), deviceFingerprint);
}

export function clearPersistedDeviceFingerprint(experience: DeviceExperience) {
  localStorage.removeItem(getBindingStorageKey(experience));
}

export async function getDeviceFingerprint(experience: DeviceExperience) {
  const existing = localStorage.getItem(getBindingStorageKey(experience));
  if (existing) {
    return existing;
  }

  const response = await fetch("/api/device/fingerprint", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ experience }),
  });

  if (!response.ok) {
    throw new Error("Unable to prepare a stable device fingerprint.");
  }

  const payload = (await response.json()) as { deviceFingerprint?: unknown };
  if (typeof payload.deviceFingerprint !== "string" || !payload.deviceFingerprint) {
    throw new Error("The device fingerprint response was malformed.");
  }

  persistDeviceFingerprint(experience, payload.deviceFingerprint);
  return payload.deviceFingerprint;
}
