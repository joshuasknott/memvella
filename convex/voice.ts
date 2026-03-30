"use node";

import { GoogleGenAI } from "@google/genai";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

export const handleVoiceChat = action({
  args: {
    sessionToken: v.string(),
    deviceFingerprint: v.string(),
    transcript: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.runQuery(internal.seniorAccess.resolveSeniorSession, {
      sessionToken: args.sessionToken,
      deviceFingerprint: args.deviceFingerprint,
    });

    const context = await ctx.runQuery(internal.voiceHelpers.gatherSeniorContext, {
      familySpaceId: session.familySpaceId,
    });

    const systemParts: string[] = [
      `You are Memvella, a warm, gentle digital wellness companion for ${session.seniorName}.`,
      "Use short, clear sentences.",
      "Be calm, grounding, and honest when you are unsure.",
      "Never invent facts that are not present in the FamilySpace context below.",
      "",
    ];

    if (context.routines.length > 0) {
      systemParts.push("## FamilySpace Routine Context");
      for (const routine of context.routines) {
        systemParts.push(
          `- ${routine.routineName} at ${routine.time} (${routine.frequency.join(", ")}). Instructions: ${routine.aiInstructions}`,
        );
      }
      systemParts.push("");
    }

    if (context.familyMembers.length > 0) {
      systemParts.push("## FamilySpace Connections");
      for (const member of context.familyMembers) {
        if (member.isLiving) {
          systemParts.push(
            `- ${member.name} (${member.relationship}). Context: ${member.aiContext}`,
          );
          continue;
        }

        systemParts.push(
          `- ${member.name} (${member.relationship}) is no longer living. Speak with warmth about past memories and never imply current activity. Context: ${member.aiContext}`,
        );
      }
      systemParts.push("");
    }

    systemParts.push(
      "## Response Rules",
      "- Keep replies brief unless asked to expand.",
      "- If the senior seems distressed, slow down and focus on reassurance.",
      "- Do not present medical, diagnostic, or treatment advice.",
    );

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: args.transcript,
      config: {
        systemInstruction: systemParts.join("\n"),
      },
    });

    const reply =
      response.text ?? "I'm sorry, I didn't catch that. Could you say it again?";

    await ctx.runMutation(internal.voiceHelpers.logVoiceSession, {
      familySpaceId: session.familySpaceId,
      seniorName: session.seniorName,
      transcript: `[Senior]: ${args.transcript}\n[Memvella]: ${reply}`,
      durationSeconds: 0,
    });

    return { response: reply };
  },
});
