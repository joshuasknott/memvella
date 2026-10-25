import { describe, expect, it } from "vitest";
import { chapterAt, chapterForInteraction, DEMO_FRAMES, sceneAt } from "./demo-model";

describe("companion walkthrough", () => {
  it("starts with the selected design and completes a finite story", () => {
    expect(sceneAt(0, null)).toBeNull();
    expect(sceneAt(59, null)).toBeNull();
    expect(sceneAt(60, null)).toBe("story");
    expect(sceneAt(240, null)).toBe("routine");
    expect(sceneAt(390, null)).toBe("confirmed");
    expect(sceneAt(480, null)).toBe("conversation");
    expect(sceneAt(DEMO_FRAMES - 1, null)).toBe("lunch");
  });
  it("preserves manual exploration independently of playback position", () => {
    expect(sceneAt(600, "story")).toBe("story");
    expect(sceneAt(0, "next")).toBe("next");
    expect(chapterForInteraction("confirmed")).toBe("routine");
    expect(chapterForInteraction("next")).toBe("conversation");
  });
  it("selects chapters at their exact boundaries", () => {
    expect(chapterAt(239)).toBe("memory");
    expect(chapterAt(240)).toBe("routine");
    expect(chapterAt(479)).toBe("routine");
    expect(chapterAt(480)).toBe("conversation");
  });
});
