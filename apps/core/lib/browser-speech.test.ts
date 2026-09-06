import { afterEach, expect, it, vi } from "vitest";
import { speakText } from "./browser-speech";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it("reads a reply at the requested accessible pace", async () => {
  vi.stubEnv("NEXT_PUBLIC_MEMVELLA_TEST_MODE", "0");
  const speak = vi.fn((utterance) => { utterance.onstart(); utterance.onend(); });
  vi.stubGlobal("window", { speechSynthesis: { cancel: vi.fn(), speak } });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
  const end = vi.fn();
  await speakText("Take your time.", { rate: 0.75, lang: "en-GB", onEnd: end });
  expect(speak.mock.calls[0]![0]).toMatchObject({ text: "Take your time.", rate: 0.75, lang: "en-GB" });
  expect(end).toHaveBeenCalledOnce();
});
