"use client";

export type BrowserPushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const SUPPORTER_NOTIFICATION_SW_PATH = "/memvella-notifications-sw.js";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const normalized = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(normalized);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function getPushPublicKey() {
  return process.env.NEXT_PUBLIC_MEMVELLA_WEB_PUSH_PUBLIC_KEY ?? null;
}

export function isPushNotificationsSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

function normalizeSubscription(
  subscription: PushSubscription,
): BrowserPushSubscriptionPayload {
  const json = subscription.toJSON();
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;

  if (!json.endpoint || !p256dh || !auth) {
    throw new Error("The browser returned an incomplete push subscription.");
  }

  return {
    endpoint: json.endpoint,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh,
      auth,
    },
  };
}

async function getRegistration() {
  return await navigator.serviceWorker.register(SUPPORTER_NOTIFICATION_SW_PATH);
}

export async function getCurrentPushSubscription() {
  if (!isPushNotificationsSupported()) {
    return null;
  }

  const registration = await getRegistration();
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? normalizeSubscription(subscription) : null;
}

export async function subscribeToPushNotifications() {
  if (!isPushNotificationsSupported()) {
    throw new Error("This browser does not support push notifications.");
  }

  const pushPublicKey = getPushPublicKey();
  if (!pushPublicKey) {
    throw new Error("Push notifications are not configured for this build.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const registration = await getRegistration();
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    return {
      permissionState: permission,
      subscription: normalizeSubscription(existingSubscription),
    };
  }

  const nextSubscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(pushPublicKey),
  });

  return {
    permissionState: permission,
    subscription: normalizeSubscription(nextSubscription),
  };
}

export async function unsubscribeFromPushNotifications() {
  if (!isPushNotificationsSupported()) {
    return { permissionState: "unsupported" as const, endpoint: null };
  }

  const registration = await getRegistration();
  const existingSubscription = await registration.pushManager.getSubscription();
  if (!existingSubscription) {
    return { permissionState: Notification.permission, endpoint: null };
  }

  const endpoint = existingSubscription.endpoint;
  await existingSubscription.unsubscribe();

  return {
    permissionState: Notification.permission,
    endpoint,
  };
}

export function getCurrentDeviceLabel() {
  if (typeof navigator === "undefined") {
    return "Workspace owner device";
  }

  const navigatorWithUserAgentData = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
    };
  };
  const platform =
    navigatorWithUserAgentData.userAgentData?.platform ||
    navigator.platform ||
    "Device";
  return `Workspace owner ${platform}`.trim();
}
