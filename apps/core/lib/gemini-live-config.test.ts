import { expect, it } from "vitest";
import { buildAssistedLiveConnectConfig } from "./gemini-live-config";

it("uses explicit turn boundaries only when requested", () => {
  expect(buildAssistedLiveConnectConfig(undefined, true).realtimeInputConfig?.automaticActivityDetection).toEqual({ disabled: true });
  expect(buildAssistedLiveConnectConfig().realtimeInputConfig?.automaticActivityDetection).toMatchObject({ disabled: false, silenceDurationMs: 2000 });
});
