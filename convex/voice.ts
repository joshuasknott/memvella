"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// =============================================================================
// MEMVELLA — Voice Conversational Engine (Tap-to-Talk)
// =============================================================================
// This file powers the Senior Kiosk's "Tap to Talk" feature.
//
// Architecture:
//   - gatherSeniorContext (internalQuery) → in voiceHelpers.ts
//   - logVoiceSession (internalMutation) → in voiceHelpers.ts
//   - handleVoiceChat (action) → THIS FILE
//
// The query and mutation are in voiceHelpers.ts because Convex requires that
// "use node" files contain ONLY actions.
//
// Safety:
//   - The TEMPORAL SAFETY FLAG (isLiving) is checked for every family member.
//   - Deceased relatives are explicitly flagged in the system instruction so
//     Gemini NEVER implies they are alive ("The Hallucination of Grief" guard).
//   - Routines are injected as ground-truth anchors so the AI cannot hallucinate
//     schedule information.
// =============================================================================

// =============================================================================
// THE VOICE ACTION (public action)
// =============================================================================
// Called by the senior kiosk frontend when the senior speaks.
//
// Flow:
//   1. Gather the caregiver's family + routine data via internal query
//   2. Assemble the Dual-Graph RAG system instruction with safety guardrails
//   3. Call Gemini 2.5 Flash via @google/genai SDK
//   4. Log the interaction via internal mutation (audit trail)
//   5. Return Gemini's text response to the client
// =============================================================================
export const handleVoiceChat = action({
  args: {
    caregiverId: v.string(),    // tokenIdentifier from PIN pairing
    seniorName: v.string(),     // display name for the tablet
    transcript: v.string(),     // what the senior said
  },
  handler: async (ctx, args) => {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Gather Context
    // ─────────────────────────────────────────────────────────────────────────
    const context = await ctx.runQuery(internal.voiceHelpers.gatherSeniorContext, {
      caregiverId: args.caregiverId,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Assemble the Dual-Graph RAG System Instruction
    // ─────────────────────────────────────────────────────────────────────────
    const systemParts: string[] = [];

    // Core identity
    systemParts.push(
      `You are Memvella, a warm, gentle, and patient wellness companion for ${args.seniorName}.`,
      `You speak simply and clearly. Use short sentences. Never use jargon.`,
      `You are kind, reassuring, and never condescending.`,
      `If you are unsure about something, say so honestly rather than guessing.`,
      `Never invent facts. Only reference information you have been given below.`,
      ``
    );

    // ── TRUTH GRAPH: Routines ──────────────────────────────────────────────
    if (context.routines.length > 0) {
      systemParts.push(`## Today's Schedule (Ground Truth — do not invent other events)`);
      for (const routine of context.routines) {
        systemParts.push(
          `- ${routine.routineName} at ${routine.time} (${routine.frequency.join(", ")}). ` +
          `Instructions: ${routine.aiInstructions}`
        );
      }
      systemParts.push(``);
    } else {
      systemParts.push(
        `## Schedule`,
        `No routines have been set up yet. If asked about the schedule, say "I don't have any events on the schedule right now, but that's perfectly okay."`,
        ``
      );
    }

    // ── SAFETY DIRECTORY: Family Members ───────────────────────────────────
    if (context.familyMembers.length > 0) {
      systemParts.push(`## Family & Friends (Safety Directory)`);
      for (const member of context.familyMembers) {
        if (member.isLiving) {
          // ✅ Living — safe to reference normally
          systemParts.push(
            `- ${member.name} (${member.relationship}) — Living. Context: ${member.aiContext}`
          );
        } else {
          // ⚠️ TEMPORAL SAFETY FLAG — DECEASED
          // This is the critical guardrail against "The Hallucination of Grief".
          // The AI must NEVER imply this person is visiting, coming over, or active.
          systemParts.push(
            `- ${member.name} (${member.relationship}) — ⚠️ DECEASED. ` +
            `${member.name} is deceased. Do not suggest they are visiting or currently active. ` +
            `If ${args.seniorName} mentions ${member.name}, respond with warmth and fondness ` +
            `about past memories, but never imply ${member.name} is still alive. ` +
            `Context: ${member.aiContext}`
          );
        }
      }
      systemParts.push(``);
    }

    // Final instruction
    systemParts.push(
      `## Response Guidelines`,
      `- Keep responses brief (2-3 sentences max unless asked to elaborate).`,
      `- If ${args.seniorName} seems confused or distressed, be extra gentle and grounding.`,
      `- Refer to routines and family members naturally, as if you know them well.`,
      `- Never say "according to my records" or "I was told". Speak naturally.`
    );

    const systemInstruction = systemParts.join("\n");

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3: Call Gemini via @google/genai SDK
    // ─────────────────────────────────────────────────────────────────────────
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: args.transcript,
      config: {
        systemInstruction,
      },
    });

    const aiResponse =
      response.text ?? "I'm sorry, I didn't quite catch that. Could you say it again?";

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Log the interaction (Audit Trail)
    // ─────────────────────────────────────────────────────────────────────────
    const fullTranscript = `[Senior]: ${args.transcript}\n[Memvella]: ${aiResponse}`;

    await ctx.runMutation(internal.voiceHelpers.logVoiceSession, {
      caregiverId: args.caregiverId,
      seniorName: args.seniorName,
      transcript: fullTranscript,
      durationSeconds: 0,
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Return the AI's response to the kiosk frontend
    // ─────────────────────────────────────────────────────────────────────────
    return { response: aiResponse };
  },
});
