import { describe, expect, it } from "vitest";

function sanitizeNextPath(value: string | null): string {
  if (!value) return "/circle";

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return "/circle";
  if (trimmed.includes("\\")) return "/circle";

  try {
    const resolved = new URL(trimmed, "https://x");
    if (resolved.origin !== "https://x") return "/circle";
    return resolved.pathname + resolved.search + resolved.hash || "/circle";
  } catch {
    return "/circle";
  }
}

describe("sanitizeNextPath", () => {
  it("defaults to /circle for null or empty", () => {
    expect(sanitizeNextPath(null)).toBe("/circle");
    expect(sanitizeNextPath("")).toBe("/circle");
    expect(sanitizeNextPath("   ")).toBe("/circle");
  });

  it("accepts valid internal paths", () => {
    expect(sanitizeNextPath("/circle")).toBe("/circle");
    expect(sanitizeNextPath("/circle/memories")).toBe("/circle/memories");
    expect(sanitizeNextPath("/onboarding/organiser?step=2")).toBe(
      "/onboarding/organiser?step=2",
    );
    expect(sanitizeNextPath("/circle#section")).toBe("/circle#section");
  });

  it("rejects absolute URLs", () => {
    expect(sanitizeNextPath("https://evil.com")).toBe("/circle");
    expect(sanitizeNextPath("http://evil.com")).toBe("/circle");
  });

  it("rejects protocol-relative URLs", () => {
    expect(sanitizeNextPath("//evil.com")).toBe("/circle");
    expect(sanitizeNextPath("//evil.com/path")).toBe("/circle");
  });

  it("rejects backslash tricks", () => {
    expect(sanitizeNextPath("/\\evil.com")).toBe("/circle");
    expect(sanitizeNextPath("\\evil.com")).toBe("/circle");
  });

  it("rejects encoded external URLs", () => {
    expect(sanitizeNextPath("https%3A%2F%2Fevil.com")).toBe("/circle");
  });

  it("preserves query strings and hashes on internal paths", () => {
    expect(sanitizeNextPath("/circle?tab=memories&sort=new")).toBe(
      "/circle?tab=memories&sort=new",
    );
    expect(sanitizeNextPath("/circle/memories#top")).toBe(
      "/circle/memories#top",
    );
  });
});
