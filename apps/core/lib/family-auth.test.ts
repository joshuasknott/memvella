import { describe, expect, it } from "vitest";
import {
  buildVerifyEmailPath,
  isEmailNotVerifiedError,
  sanitizeFamilyNextPath,
} from "./family-auth";

describe("family auth routing", () => {
  it("keeps local next paths and rejects external redirects", () => {
    expect(sanitizeFamilyNextPath("/circle/settings?tab=account")).toBe(
      "/circle/settings?tab=account",
    );
    expect(sanitizeFamilyNextPath("//evil.example")).toBe("/circle");
    expect(sanitizeFamilyNextPath("https://evil.example")).toBe("/circle");
    expect(sanitizeFamilyNextPath("/\\evil.example")).toBe("/circle");
  });

  it("detects email verification errors by stable code", () => {
    expect(isEmailNotVerifiedError({ code: "EMAIL_NOT_VERIFIED" })).toBe(true);
    expect(isEmailNotVerifiedError({ message: "Email not verified" })).toBe(false);
  });

  it("builds a verification route with a sanitized destination", () => {
    expect(buildVerifyEmailPath("sarah@example.com", "//evil.example")).toBe(
      "/organiser/verify-email?email=sarah%40example.com&next=%2Fcircle",
    );
  });
});
