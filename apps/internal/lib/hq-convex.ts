import { ConvexHttpClient } from "convex/browser";
import { api } from "@memvella/backend";
import type { Id } from "@memvella/backend/dataModel";
import { requireHqSession } from "@/lib/hq-auth";

export type HqDataResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string };

function getConvexUrl() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL?.trim() || process.env.CONVEX_URL?.trim();
  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL for Memvella HQ.");
  }

  return url;
}

function getReadToken() {
  const token = process.env.MEMVELLA_HQ_READ_TOKEN?.trim();
  if (!token) {
    throw new Error("Missing MEMVELLA_HQ_READ_TOKEN for Memvella HQ.");
  }

  return token;
}

function getClient() {
  return new ConvexHttpClient(getConvexUrl());
}

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Memvella HQ data is unavailable.";
}

async function guarded<T>(loader: () => Promise<T>): Promise<HqDataResult<T>> {
  await requireHqSession();
  try {
    return { ok: true, data: await loader() };
  } catch (error) {
    return { ok: false, message: toErrorMessage(error) };
  }
}

export async function getMissionControlSnapshot() {
  return await guarded(async () =>
    getClient().query(api.hq.getMissionControlSnapshot, { token: getReadToken() }),
  );
}

export async function getCompanyOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getCompanyOverview, { token: getReadToken() }),
  );
}

export async function getProductOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getProductOverview, { token: getReadToken() }),
  );
}

export async function listProductCircles(cursor: string | null = null) {
  return await guarded(async () =>
    getClient().query(api.hq.listProductCircles, {
      token: getReadToken(),
      paginationOpts: { numItems: 24, cursor },
    }),
  );
}

export async function getProductCircleDetail(circleId: string) {
  return await guarded(async () =>
    getClient().query(api.hq.getProductCircleDetail, {
      token: getReadToken(),
      circleId: circleId as Id<"circles">,
    }),
  );
}

export async function getGrowthOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getGrowthOverview, { token: getReadToken() }),
  );
}

export async function getOperationsOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getOperationsOverview, { token: getReadToken() }),
  );
}

export async function getTrustSafetyOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getTrustSafetyOverview, { token: getReadToken() }),
  );
}

export async function getVoiceAiOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getVoiceAiOverview, { token: getReadToken() }),
  );
}

export async function getObservabilityOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getObservabilityOverview, { token: getReadToken() }),
  );
}

export async function getQaDevOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getQaDevOverview, { token: getReadToken() }),
  );
}

export async function getAutomationOverview() {
  return await guarded(async () =>
    getClient().query(api.hq.getAutomationOverview, { token: getReadToken() }),
  );
}
