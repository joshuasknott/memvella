import { NextRequest, NextResponse } from "next/server";
import {
  appendDeviceBindingCookie,
  buildDeviceFingerprint,
  getOrCreateDeviceBindingSeed,
  type DeviceExperience,
} from "@/lib/server-device-binding";

export const runtime = "nodejs";

function isDeviceExperience(value: unknown): value is DeviceExperience {
  return value === "assisted" || value === "independent";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { experience?: unknown };
    if (!isDeviceExperience(body.experience)) {
      return NextResponse.json(
        { error: "A valid device experience is required." },
        { status: 400 },
      );
    }

    const binding = getOrCreateDeviceBindingSeed(request);
    const response = NextResponse.json(
      {
        deviceFingerprint: buildDeviceFingerprint(
          binding.seed,
          body.experience,
        ),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    if (binding.isNew) {
      appendDeviceBindingCookie(response, request, binding.seed);
    }

    return response;
  } catch (error) {
    console.error("Device fingerprint issue:", error);
    return NextResponse.json(
      { error: "Unable to prepare this device." },
      { status: 500 },
    );
  }
}
