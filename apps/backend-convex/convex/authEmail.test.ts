import { describe, expect, it } from "vitest";
import {
  buildAuthEmailContent,
  isFamilyEmailVerificationRequired,
} from "./authEmail";

describe("family auth email content", () => {
  it("builds verification mail without leaking unsafe HTML", () => {
    const content = buildAuthEmailContent({
      kind: "verification",
      recipientEmail: "sarah@example.com",
      recipientName: "<Sarah>",
      url: "https://example.com/verify?token=a&next=/circle",
    });

    expect(content.subject).toBe("Verify your Memvella email");
    expect(content.html).toContain("&lt;Sarah&gt;");
    expect(content.html).toContain("token=a&amp;next=/circle");
    expect(content.html).not.toContain("<Sarah>");
  });

  it("builds password-reset mail with a non-disclosing fallback greeting", () => {
    const content = buildAuthEmailContent({
      kind: "password_reset",
      recipientEmail: "member@example.com",
      recipientName: "",
      url: "https://example.com/reset",
    });

    expect(content.subject).toBe("Reset your Memvella password");
    expect(content.text).toContain("Hello there");
    expect(content.text).toContain("https://example.com/reset");
  });

  it("requires verification outside guarded test mode", () => {
    const previousTestMode = process.env.MEMVELLA_TEST_MODE;
    try {
      delete process.env.MEMVELLA_TEST_MODE;
      expect(isFamilyEmailVerificationRequired()).toBe(true);
      process.env.MEMVELLA_TEST_MODE = "1";
      expect(isFamilyEmailVerificationRequired()).toBe(false);
    } finally {
      if (previousTestMode === undefined) {
        delete process.env.MEMVELLA_TEST_MODE;
      } else {
        process.env.MEMVELLA_TEST_MODE = previousTestMode;
      }
    }
  });
});
