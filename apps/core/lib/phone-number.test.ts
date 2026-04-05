import { describe, expect, it } from "vitest";
import { isValidE164PhoneNumber, normalizePhoneNumber } from "./phone-number";

describe("normalizePhoneNumber", () => {
  it("normalizes a local number with a selected country code", () => {
    expect(
      normalizePhoneNumber({
        countryCode: "+44",
        phoneNumber: "07700 900000",
      }),
    ).toBe("+447700900000");
  });

  it("accepts a direct E.164 number", () => {
    expect(
      normalizePhoneNumber({
        countryCode: "+44",
        phoneNumber: "+15551234567",
      }),
    ).toBe("+15551234567");
  });

  it("rejects invalid values", () => {
    expect(
      normalizePhoneNumber({
        countryCode: "+44",
        phoneNumber: "12",
      }),
    ).toBeNull();
    expect(isValidE164PhoneNumber("07700900000")).toBe(false);
  });
});
