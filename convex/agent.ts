"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

// =============================================================================
// SYSTEM PROMPT
// =============================================================================
// Instructs Gemini to act as the Memvella onboarding voice assistant.
// The JSON contract is strict: every response MUST include `reply` and
// `actionPayload`. The frontend uses `reply` for TTS; the backend uses
// `actionPayload` to write to the database.
// =============================================================================
const SYSTEM_PROMPT = `You are a warm, empathetic onboarding assistant for Memvella, an app that helps caregivers preserve memories for their loved ones.

Your job is to have a natural, conversational voice exchange with a new user to collect the information needed to set up their account.

You MUST respond with a single valid JSON object and nothing else — no markdown fences, no preamble.

The JSON object must have exactly two keys:

1. "reply": A short, warm sentence to speak aloud to the user. Write it as natural speech. Do not use lists or markdown.

2. "actionPayload": An object describing what database action to take based on the user's utterance. It must always include an "action" key with one of these values:
   - "update_profile": Use this when the user provides their name, their loved one's name, or their role. Include any of these fields as needed: caregiverName (string), lovedOneName (string), role ("caregiver" | "assisted_senior" | "independent_senior"), onboarding_step (number).
   - "add_relation": Use this when the user mentions a family member or friend. Include: name (string), relationship (string, e.g. "Son", "Daughter", "Friend"), aiContext (string — a sentence of helpful context about this person).
   - "none": Use this when the user's message is a greeting, a question, or does not contain any extractable profile data.

Role guidance:
- If the user says they are setting up the app for themselves (they are the senior), use role: "independent_senior".
- If the user says they are setting it up for a parent, spouse, or someone else, use role: "caregiver".
- If the user indicates the senior needs assisted living support, use role: "assisted_senior".

Example output:
{"reply": "That's lovely! I've noted that Margaret is your mum. What's your name?", "actionPayload": {"action": "add_relation", "name": "Margaret", "relationship": "Mother", "aiContext": "Margaret is the user's mother and the loved one being cared for."}}`;

// =============================================================================
// handleOnboardingInput
// =============================================================================
// Public action — callable from the frontend during conversational onboarding.
//
// Flow:
//   1. Authenticate the caller
//   2. Call Gemini with the system prompt + user utterance
//   3. Parse the structured JSON response
//   4. If an actionable payload is returned, run the internal bridge mutation
//   5. Return { reply, actionPayload } to the frontend for TTS + UI updates
//
// Error handling:
//   - Gemini API failures → throws with a clear message
//   - Malformed JSON → falls back to a safe reply, skips the DB write
//   - Auth failure → throws immediately
// =============================================================================
export const handleOnboardingInput = action({
  args: {
    userInput: v.string(),
  },
  handler: async (ctx, args) => {
    // -------------------------------------------------------------------------
    // 1. Auth guard
    // -------------------------------------------------------------------------
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error(
        "Unauthenticated: handleOnboardingInput requires a valid session."
      );
    }

    // -------------------------------------------------------------------------
    // 2. Read API key from Convex environment variables
    //    Set this with: npx convex env set GEMINI_API_KEY <your-key>
    // -------------------------------------------------------------------------
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Run: npx convex env set GEMINI_API_KEY <your-key>"
      );
    }

    // -------------------------------------------------------------------------
    // 3. Call Gemini
    // -------------------------------------------------------------------------
    const ai = new GoogleGenAI({ apiKey });

    const geminiResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: args.userInput,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        // Enforce JSON output at the model level — reduces hallucination risk
        responseMimeType: "application/json",
        temperature: 0.4, // Low temperature for consistent structured output
      },
    });

    const rawText = geminiResponse.text ?? "";

    // -------------------------------------------------------------------------
    // 4. Parse the structured response
    //    Graceful fallback: if the model breaks its own format, we still return
    //    something speakable rather than crashing the onboarding flow.
    // -------------------------------------------------------------------------
    let parsed: { reply: string; actionPayload: Record<string, unknown> };

    try {
      // Strip any accidental markdown fences the model may have emitted
      const cleaned = rawText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();

      parsed = JSON.parse(cleaned);

      if (typeof parsed.reply !== "string" || !parsed.actionPayload) {
        throw new Error("Response missing required 'reply' or 'actionPayload' keys.");
      }
    } catch (parseError) {
      console.error(
        "[handleOnboardingInput] Failed to parse Gemini response:",
        parseError,
        "Raw text:",
        rawText
      );

      // Safe fallback — keep the conversation going without a DB write
      return {
        reply:
          "I'm sorry, I didn't quite catch that. Could you say that again?",
        actionPayload: { action: "none" },
        __parseError: true,
      };
    }

    // -------------------------------------------------------------------------
    // 5. Write to the database via the internal bridge mutation
    // -------------------------------------------------------------------------
    const actionType = parsed.actionPayload?.action;

    if (actionType && actionType !== "none") {
      try {
        await ctx.runMutation(internal.aiActions.processOnboardingAction, {
          actionPayload: parsed.actionPayload,
        });
      } catch (mutationError) {
        // Log but don't crash — the reply is still valuable even if the write
        // fails (e.g. profile not yet created). The frontend can retry.
        console.error(
          "[handleOnboardingInput] DB mutation failed for action:",
          actionType,
          mutationError
        );
      }
    }

    // -------------------------------------------------------------------------
    // 6. Return the reply to the frontend for TTS synthesis
    // -------------------------------------------------------------------------
    return {
      reply: parsed.reply,
      actionPayload: parsed.actionPayload,
    };
  },
});
