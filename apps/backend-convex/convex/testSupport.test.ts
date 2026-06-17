import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ensureTestSupportAccess } from "./testSupport";

describe("test support security gate", () => {
  const originalTestMode = process.env.MEMVELLA_TEST_MODE;
  const originalTestToken = process.env.MEMVELLA_TEST_AUTH_TOKEN;

  beforeEach(() => {
    delete process.env.MEMVELLA_TEST_MODE;
    delete process.env.MEMVELLA_TEST_AUTH_TOKEN;
  });

  afterEach(() => {
    if (originalTestMode !== undefined) {
      process.env.MEMVELLA_TEST_MODE = originalTestMode;
    } else {
      delete process.env.MEMVELLA_TEST_MODE;
    }
    if (originalTestToken !== undefined) {
      process.env.MEMVELLA_TEST_AUTH_TOKEN = originalTestToken;
    } else {
      delete process.env.MEMVELLA_TEST_AUTH_TOKEN;
    }
  });

  it("rejects when MEMVELLA_TEST_MODE is not set", () => {
    expect(() => ensureTestSupportAccess("any-token")).toThrow(
      "Test support is not available outside test mode.",
    );
  });

  it("rejects when MEMVELLA_TEST_MODE is 0", () => {
    process.env.MEMVELLA_TEST_MODE = "0";
    expect(() => ensureTestSupportAccess("any-token")).toThrow(
      "Test support is not available outside test mode.",
    );
  });

  it("rejects the default token outside test mode", () => {
    expect(() => ensureTestSupportAccess("memvella-local-test-token")).toThrow(
      "Test support is not available outside test mode.",
    );
  });

  it("allows the default token in test mode when MEMVELLA_TEST_AUTH_TOKEN is unset", () => {
    process.env.MEMVELLA_TEST_MODE = "1";
    expect(() =>
      ensureTestSupportAccess("memvella-local-test-token"),
    ).not.toThrow();
  });

  it("rejects wrong token in test mode with default token", () => {
    process.env.MEMVELLA_TEST_MODE = "1";
    expect(() => ensureTestSupportAccess("wrong-token")).toThrow(
      "Invalid Memvella test auth token.",
    );
  });

  it("accepts configured token in test mode", () => {
    process.env.MEMVELLA_TEST_MODE = "1";
    process.env.MEMVELLA_TEST_AUTH_TOKEN = "configured-secret";
    expect(() =>
      ensureTestSupportAccess("configured-secret"),
    ).not.toThrow();
  });

  it("rejects default token in test mode when a configured token is set", () => {
    process.env.MEMVELLA_TEST_MODE = "1";
    process.env.MEMVELLA_TEST_AUTH_TOKEN = "configured-secret";
    expect(() =>
      ensureTestSupportAccess("memvella-local-test-token"),
    ).toThrow("Invalid Memvella test auth token.");
  });

  it("rejects empty-string token in test mode", () => {
    process.env.MEMVELLA_TEST_MODE = "1";
    expect(() => ensureTestSupportAccess("")).toThrow(
      "Invalid Memvella test auth token.",
    );
  });
});
