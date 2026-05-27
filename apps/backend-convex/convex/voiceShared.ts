import type { Id } from "./_generated/dataModel";

export type SeniorAiContext = {
  circleName: string;
  timeZone: string;
  locale: string;
  routines: Array<{
    title: string;
    time: string;
    frequency: string[];
    aiInstructions: string | null;
    startDate: string | null;
    endDate: string | null;
  }>;
  people: Array<{
    name: string;
    relationship: string;
    isLiving: boolean;
    aiContext: string;
  }>;
  recentMemories: Array<{
    title: string;
    memoryDate: string | null;
    summary: string;
  }>;
  recentVoiceInteractions: Array<{
    transcript: string;
    assistantResponse: string | null;
    intentType:
      | "conversation"
      | "memory_draft"
      | "routine_draft"
      | "medical_rejection"
      | "unknown";
    distressDetected: boolean;
    createdAt: number;
  }>;
};

export type ResolvedSeniorSession = {
  circleId: Id<"circles"> | null;
  seniorProfileId: Id<"seniorProfiles">;
  seniorName: string;
  seniorMode: "assisted" | "independent";
  sessionType: "assisted_device" | "independent_web";
  sessionId: Id<"seniorAccessSessions">;
  sourceCircleMembershipId: Id<"circleMemberships"> | null;
};

export function buildAssistedSystemPrompt(
  seniorName: string,
  context: SeniorAiContext,
  distressDetected = false,
) {
  const sections = [
    `You are Memvella speaking with ${seniorName}.`,
    "Reply in 1 to 3 short, grounding sentences.",
    "Use only facts from this Circle context.",
    "If a detail is missing, say you do not know.",
    "Never give medical, dosage, diagnosis, or treatment advice.",
    "If the speaker seems confused or repeats themself, use recent voice history plus familiar routines, memories, and connections to gently reorient them.",
    distressDetected
      ? "If the transcript suggests distress, begin with reassurance and one clear next step."
      : "Keep the tone warm and direct.",
    `Circle: ${context.circleName}`,
  ];

  if (context.routines.length > 0) {
    sections.push(
      `Routines: ${context.routines
        .map((routine) => {
          const scheduleWindow =
            routine.startDate || routine.endDate
              ? `, active ${routine.startDate ?? "now"} to ${routine.endDate ?? "open"}`
              : "";
          const notes = routine.aiInstructions ? `, note: ${routine.aiInstructions}` : "";
          return `${routine.title} at ${routine.time} on ${routine.frequency.join(", ")}${notes}${scheduleWindow}`;
        })
        .join("; ")}`,
    );
  }

  if (context.people.length > 0) {
    sections.push(
      `People: ${context.people
        .map((person) =>
          person.isLiving
            ? `${person.name} is ${person.relationship}${person.aiContext ? `: ${person.aiContext}` : ""}`
            : `${person.name} was ${person.relationship}. Speak about past memories only${person.aiContext ? `: ${person.aiContext}` : ""}`,
        )
        .join("; ")}`,
    );
  }

  if (context.recentMemories.length > 0) {
    sections.push(
      `Recent memories: ${context.recentMemories
        .map(
          (memory) =>
            `${memory.title}${memory.memoryDate ? ` (${memory.memoryDate})` : ""}: ${memory.summary}`,
        )
        .join("; ")}`,
    );
  }

  if (context.recentVoiceInteractions.length > 0) {
    sections.push(
      `Recent voice history: ${context.recentVoiceInteractions
        .map((interaction) => {
          const assistantReply = interaction.assistantResponse
            ? ` | Memvella: ${interaction.assistantResponse}`
            : "";
          const distressLabel = interaction.distressDetected ? " [distress]" : "";
          return `Senior: ${interaction.transcript}${assistantReply}${distressLabel}`;
        })
        .join("; ")}`,
    );
  }

  return sections.join("\n");
}
