import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { createConvexHttpClient } from "@/lib/convex-http";
import {
  appendDeviceBindingCookie,
  buildDeviceFingerprint,
  buildNetworkThrottleFingerprint,
  getOrCreateDeviceBindingSeed,
} from "@/lib/server-device-binding";

export const runtime = "nodejs";

type AssistedPairingResponse =
  | {
      success: true;
      seniorName: string;
      sessionToken: string;
      deviceFingerprint: string;
      expiresAt: number;
      idleExpiresAt: number;
    }
  | {
      success: false;
      error: string;
    };

const NETWORK_WINDOW_MS = 10 * 60 * 1000;
const NETWORK_BLOCK_MS = 20 * 60 * 1000;
const NETWORK_MAX_HITS = 5;
const networkThrottleWindows = new Map<
  string,
  { windowStart: number; hits: number; blockedUntil: number | null }
>();

function pruneExpiredNetworkWindows(now: number) {
  for (const [key, value] of networkThrottleWindows.entries()) {
    const idleForMs = now - value.windowStart;
    if (
      idleForMs > NETWORK_WINDOW_MS * 2 &&
      (value.blockedUntil === null || value.blockedUntil <= now)
    ) {
      networkThrottleWindows.delete(key);
    }
  }
}

function consumeNetworkThrottle(scopeKey: string) {
  const now = Date.now();
  pruneExpiredNetworkWindows(now);

  const existing = networkThrottleWindows.get(scopeKey);
  if (!existing) {
    networkThrottleWindows.set(scopeKey, {
      windowStart: now,
      hits: 1,
      blockedUntil: null,
    });
    return { allowed: true as const, retryAfterMs: 0 };
  }

  if (existing.blockedUntil !== null && existing.blockedUntil > now) {
    return {
      allowed: false as const,
      retryAfterMs: existing.blockedUntil - now,
    };
  }

  if (now - existing.windowStart >= NETWORK_WINDOW_MS) {
    networkThrottleWindows.set(scopeKey, {
      windowStart: now,
      hits: 1,
      blockedUntil: null,
    });
    return { allowed: true as const, retryAfterMs: 0 };
  }

  const nextHits = existing.hits + 1;
  if (nextHits > NETWORK_MAX_HITS) {
    const blockedUntil = now + NETWORK_BLOCK_MS;
    networkThrottleWindows.set(scopeKey, {
      windowStart: existing.windowStart,
      hits: nextHits,
      blockedUntil,
    });
    return {
      allowed: false as const,
      retryAfterMs: blockedUntil - now,
    };
  }

  networkThrottleWindows.set(scopeKey, {
    ...existing,
    hits: nextHits,
    blockedUntil: null,
  });
  return { allowed: true as const, retryAfterMs: 0 };
}

function formatRetryMessage(retryAfterMs: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `Too many pairing attempts. Wait ${retryAfterSeconds} seconds before trying another code.`;
}

export async function POST(request: NextRequest) {
  try {
    const { pinCode } = (await request.json()) as { pinCode?: unknown };
    if (typeof pinCode !== "string" || !/^\d{6}$/.test(pinCode.trim())) {
      return NextResponse.json<AssistedPairingResponse>(
        {
          success: false,
          error: "Enter the 6-digit code from your Supporter.",
        },
        { status: 400 },
      );
    }

    const binding = getOrCreateDeviceBindingSeed(request);
    const networkScopeKey = buildNetworkThrottleFingerprint(binding.seed, request);
    const networkRateLimit = consumeNetworkThrottle(networkScopeKey);
    if (!networkRateLimit.allowed) {
      const response = NextResponse.json<AssistedPairingResponse>(
        {
          success: false,
          error: formatRetryMessage(networkRateLimit.retryAfterMs),
        },
        {
          status: 429,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );

      if (binding.isNew) {
        appendDeviceBindingCookie(response, request, binding.seed);
      }

      return response;
    }

    const deviceFingerprint = buildDeviceFingerprint(binding.seed, "assisted");
    const convex = createConvexHttpClient();
    const result = await convex.mutation(api.kiosk.pairTabletSession, {
      pinCode: pinCode.trim(),
      deviceFingerprint,
    });

    const response = result.success
      ? NextResponse.json<AssistedPairingResponse>(
          {
            ...result,
            deviceFingerprint,
          },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          },
        )
      : NextResponse.json<AssistedPairingResponse>(result, {
          status: 400,
          headers: {
            "Cache-Control": "no-store",
          },
        });

    if (binding.isNew) {
      appendDeviceBindingCookie(response, request, binding.seed);
    }

    return response;
  } catch (error) {
    console.error("Assisted pairing failed:", error);
    return NextResponse.json<AssistedPairingResponse>(
      {
        success: false,
        error: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
