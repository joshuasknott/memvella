"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const SYSTEM_PROMPT = `You are a warm onboarding assistant for Memvella.

You help a new account holder set up their Workspace through natural conversation.

You MUST respond with a single valid JSON object and nothing else.

The JSON object must have exactly two keys:

1. "reply": a short sentence to speak aloud.
2. "actionPayload": an object with an "action" key.

Allowed actions:
- "update_profile": use when the speaker shares their name or the senior's display name. Valid keys are organiserName, seniorDisplayName, and onboardingStep.
- "add_relation": use when the speaker mentions a connection. Valid keys are name, relationship, and aiContext.
- "none": use for greetings or unstructured input.

Role guidance:
- Memvella is set up by a Supporter for a senior in their Workspace.
- If the speaker says they are setting Memvella up for someone else, collect the Supporter's name and senior display name.`;

function formatRetryMessage(retryAfterMs: number) {
  const retryAfterSeconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `Please wait ${retryAfterSeconds} seconds before trying the onboarding assistant again.`;
}

export const handleOnboardingInput = action({
  args: {
    userInput: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Unauthenticated: handleOnboardingInput requires a valid session.",
      );
    }

    const rateLimit = await ctx.runMutation(internal.rateLimits.consumeRateLimit, {
      scopeKey: `onboarding:${identity.tokenIdentifier}`,
      actionKey: "handleOnboardingInput",
      maxHits: 12,
      windowMs: 5 * 60 * 1000,
      blockDurationMs: 10 * 60 * 1000,
    });

    if (!rateLimit.allowed) {
      throw new Error(formatRetryMessage(rateLimit.retryAfterMs));
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Run: npx convex env set GEMINI_API_KEY <your-key>",
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: args.userInput,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const rawText = geminiResponse.text ?? "";

    let parsed: { reply: string; actionPayload: Record<string, unknown> };
    try {
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      parsed = JSON.parse(cleaned);

      if (typeof parsed.reply !== "string" || !parsed.actionPayload) {
        throw new Error("Response missing required keys.");
      }
    } catch {
      return {
        reply: "I'm sorry, I didn't catch that. Could you say it again?",
        actionPayload: { action: "none" },
        __parseError: true,
      };
    }

    const actionType = parsed.actionPayload.action;
    if (actionType && actionType !== "none") {
      await ctx.runMutation(internal.aiActions.processOnboardingAction, {
        actionPayload: parsed.actionPayload,
      });
    }

    return {
      reply: parsed.reply,
      actionPayload: parsed.actionPayload,
    };
  },
});
