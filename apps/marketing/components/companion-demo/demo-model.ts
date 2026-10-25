export const DEMO_FPS = 30;
export const DEMO_SECONDS = 24;
export const DEMO_FRAMES = DEMO_FPS * DEMO_SECONDS;
export const chapters = [
  { id: "memory", label: "Memories", frame: 0 },
  { id: "routine", label: "Routines", frame: 240 },
  { id: "conversation", label: "Conversation", frame: 480 },
] as const;
export type Chapter = (typeof chapters)[number]["id"];
export type Interaction = "story" | "routine" | "confirmed" | "conversation" | "lunch" | "next" | null;
export const STORY = "There was always room for one more at the table. You made the roast, Dad peeled the potatoes, and I always tried to sneak an extra Yorkshire pudding. Sunday lunch was my favourite part of the week.";
export function chapterAt(frame: number): Chapter {
  return frame >= 480 ? "conversation" : frame >= 240 ? "routine" : "memory";
}
export function sceneAt(frame: number, interaction: Interaction): Interaction {
  if (interaction) return interaction;
  if (frame >= 570) return "lunch";
  if (frame >= 480) return "conversation";
  if (frame >= 390) return "confirmed";
  if (frame >= 240) return "routine";
  if (frame >= 60) return "story";
  return null;
}
export function chapterForInteraction(interaction: Interaction): Chapter {
  if (interaction === "routine" || interaction === "confirmed") return "routine";
  if (interaction === "conversation" || interaction === "lunch" || interaction === "next") return "conversation";
  return "memory";
}
