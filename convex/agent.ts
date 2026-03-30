"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

const SYSTEM_PROMPT = `You are a warm onboarding assistant for Memvella.

You help a new Supporter set up their FamilySpace through natural conversation.

You MUST respond with a single valid JSON object and nothing else.

The JSON object must have exactly two keys:

1. "reply": a short sentence to speak aloud.
2. "actionPayload": an object with an "action" key.

Allowed actions:
- "update_profile": use when the speaker shares their name, the senior's display name, or their role. Valid keys are supporterName, seniorDisplayName, role ("supporter" | "assisted_senior" | "independent_senior"), and onboardingStep.
- "add_relation": use when the speaker mentions a connection. Valid keys are name, relationship, and aiContext.
- "none": use for greetings or unstructured input.

Role guidance:
- If the speaker says they are setting Memvella up for themselves, use "independent_senior".
- If the speaker says they are setting Memvella up for another senior, use "supporter".
- If the speaker says the senior uses the read-only tablet mode, use "assisted_senior".`;

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
      try {
        await ctx.runMutation(internal.aiActions.processOnboardingAction, {
          actionPayload: parsed.actionPayload,
        });
      } catch {
        return {
          reply: parsed.reply,
          actionPayload: parsed.actionPayload,
          __mutationError: true,
        };
      }
    }

    return {
      reply: parsed.reply,
      actionPayload: parsed.actionPayload,
    };
  },
});
