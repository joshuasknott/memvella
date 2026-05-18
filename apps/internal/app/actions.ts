"use server";

import { redirect } from "next/navigation";
import { clearHqSession, createFounderSession } from "@/lib/hq-auth";

export type HqLoginState = {
  error: string | null;
};

export async function loginHq(
  _previousState: HqLoginState,
  formData: FormData,
): Promise<HqLoginState> {
  const accessKey = String(formData.get("accessKey") ?? "");
  const result = await createFounderSession(accessKey);

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/");
}

export async function logoutHq() {
  await clearHqSession();
  redirect("/");
}
