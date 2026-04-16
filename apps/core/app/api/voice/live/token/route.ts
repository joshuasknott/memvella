import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { api } from "@memvella/backend";
import { createConvexHttpClient } from "@/lib/convex-http";
import {
  buildAssistedLiveConnectConfig,
  DEFAULT_GEMINI_LIVE_MODEL,
} from "@/lib/gemini-live-config";

export const runtime = "nodejs";

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured for the Live API.");
  }

  return apiKey;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionToken?: unknown;
      deviceFingerprint?: unknown;
    };
    if (
      typeof body.sessionToken !== "string" ||
      typeof body.deviceFingerprint !== "string"
    ) {
      return NextResponse.json(
        { error: "The assisted session token and device fingerprint are required." },
        { status: 400 },
      );
    }

    const convex = createConvexHttpClient();
    const bootstrap = await convex.query(api.liveVoice.getAssistedLiveBootstrap, {
      sessionToken: body.sessionToken,
      deviceFingerprint: body.deviceFingerprint,
    });

    const model = process.env.GEMINI_LIVE_MODEL ?? DEFAULT_GEMINI_LIVE_MODEL;
    const ai = new GoogleGenAI({
      apiKey: getGeminiApiKey(),
      apiVersion: "v1alpha",
    });
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(
          Date.now() + 60 * 1000,
        ).toISOString(),
        liveConnectConstraints: {
          model,
          config: buildAssistedLiveConnectConfig(bootstrap.systemInstruction),
        },
        httpOptions: {
          apiVersion: "v1alpha",
        },
      },
    });

    return NextResponse.json(
      {
        token: token.name,
        model,
        seniorName: bootstrap.seniorName,
        locale: bootstrap.locale,
        timeZone: bootstrap.timeZone,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Live token bootstrap failed:", error);
    return NextResponse.json(
      { error: "Unable to start the live voice session." },
      { status: 500 },
    );
  }
}
