"use client";

function bufferToBase64Url(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function getBindingStorageKey(experience: "assisted" | "independent") {
  return `memvella_${experience}_device_binding`;
}

function getOrCreateBindingValue(experience: "assisted" | "independent") {
  const storageKey = getBindingStorageKey(experience);
  const existing = localStorage.getItem(storageKey);
  if (existing) {
    return existing;
  }

  const nextValue = crypto.randomUUID();
  localStorage.setItem(storageKey, nextValue);
  return nextValue;
}

export async function getDeviceFingerprint(
  experience: "assisted" | "independent",
) {
  const bindingValue = getOrCreateBindingValue(experience);
  const fingerprintSource = [
    experience,
    bindingValue,
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    String(window.screen.width),
    String(window.screen.height),
    String(navigator.hardwareConcurrency ?? ""),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");

  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(fingerprintSource),
  );

  return bufferToBase64Url(hash);
}
