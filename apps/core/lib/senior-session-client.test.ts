import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearSeniorSession, getSeniorRecoveryHintStorageKey, getSeniorSessionStorageKey, loadSeniorSession, saveSeniorSession } from "./senior-session-client";

const storage = new Map<string, string>();
beforeEach(() => {
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("senior session key isolation", () => {
  it("uses distinct keys for session and recovery hint", () => {
    expect(getSeniorSessionStorageKey("assisted")).toBe(
      "memvella_assisted_senior_session",
    );
    expect(getSeniorRecoveryHintStorageKey("assisted")).toBe(
      "memvella_assisted_senior_recovery_hint",
    );
    expect(getSeniorSessionStorageKey("assisted")).not.toBe(
      getSeniorRecoveryHintStorageKey("assisted"),
    );
  });
});

describe("saved tablet access", () => {
  it("loads a valid session and clears only tablet access during revocation", () => {
    const session = { sessionToken: "session-token", deviceFingerprint: "this-tablet", seniorName: "David" };
    storage.set("unrelated-setting", "keep me");
    saveSeniorSession("assisted", session);
    expect(loadSeniorSession("assisted")).toEqual(session);
    clearSeniorSession("assisted");
    expect(loadSeniorSession("assisted")).toBeNull();
    expect(storage.get("unrelated-setting")).toBe("keep me");
  });

  it.each(['{bad', 'null', '[]', '"token"', '{"sessionToken":42}', '{"sessionToken":" "}', '{"sessionToken":"token","deviceFingerprint":{}}'])("discards malformed session data: %s", (raw) => {
    storage.set(getSeniorSessionStorageKey("assisted"), raw);
    expect(loadSeniorSession("assisted")).toBeNull();
    expect(storage.has(getSeniorSessionStorageKey("assisted"))).toBe(false);
  });
});
