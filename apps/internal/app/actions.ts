"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearHqLoginAttempts,
  clearHqSession,
  consumeHqLoginAttempt,
  createFounderSession,
} from "@/lib/hq-auth";

export type HqLoginState = {
  error: string | null;
};

function getClientThrottleKey(headersList: Headers) {
  const forwardedFor = headersList.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  return clientIp || headersList.get("x-real-ip")?.trim() || "local";
}

export async function loginHq(
  _previousState: HqLoginState,
  formData: FormData,
): Promise<HqLoginState> {
  const throttleKey = getClientThrottleKey(await headers());
  const throttle = consumeHqLoginAttempt(throttleKey);
  if (!throttle.allowed) {
    const retryAfterMinutes = Math.max(1, Math.ceil(throttle.retryAfterMs / 60_000));
    return {
      error: `Too many failed attempts. Try again in ${retryAfterMinutes} minutes.`,
    };
  }

  const accessKey = String(formData.get("accessKey") ?? "");
  const result = await createFounderSession(accessKey);

  if (!result.ok) {
    return { error: result.error };
  }

  clearHqLoginAttempts(throttleKey);
  redirect("/");
}

export async function logoutHq() {
  await clearHqSession();
  redirect("/");
}
