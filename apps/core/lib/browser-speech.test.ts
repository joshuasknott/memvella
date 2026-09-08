import { afterEach, expect, it, vi } from "vitest";
import { speakText, stopSpeaking } from "./browser-speech";

afterEach(() => { stopSpeaking(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

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

it("settles queued speech on cancellation even when the browser sends no event", async () => {
  vi.stubEnv("NEXT_PUBLIC_MEMVELLA_TEST_MODE", "0");
  const speak = vi.fn();
  vi.stubGlobal("window", { speechSynthesis: { cancel: vi.fn(), speak } });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
  const end = vi.fn();
  const promise = speakText("Queued reply", { onEnd: end });
  const utterance = speak.mock.calls[0][0];
  const staleEnd = utterance.onend;
  stopSpeaking();
  await promise;
  staleEnd();
  expect(end).toHaveBeenCalledOnce();
  expect(utterance.onstart).toBeNull();
});

it("settles replaced speech without allowing its late events to finish the new reply", async () => {
  vi.stubEnv("NEXT_PUBLIC_MEMVELLA_TEST_MODE", "0");
  const speak = vi.fn();
  vi.stubGlobal("window", { speechSynthesis: { cancel: vi.fn(), speak } });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
  const first = speakText("First");
  const lateError = speak.mock.calls[0][0].onerror;
  const end = vi.fn();
  const second = speakText("Second", { onEnd: end });
  await first;
  lateError();
  expect(end).not.toHaveBeenCalled();
  speak.mock.calls[1][0].onend();
  await second;
  expect(end).toHaveBeenCalledOnce();
});

it("reports synchronous synthesis failures and settles the promise", async () => {
  vi.stubEnv("NEXT_PUBLIC_MEMVELLA_TEST_MODE", "0");
  vi.stubGlobal("window", { speechSynthesis: { cancel: vi.fn(), speak: () => { throw new Error("Unavailable"); } } });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
  const onError = vi.fn();
  await speakText("Reply", { onError });
  expect(onError).toHaveBeenCalledOnce();
});

it("does not cancel new speech started by the cancellation callback", async () => {
  vi.stubEnv("NEXT_PUBLIC_MEMVELLA_TEST_MODE", "0");
  let queued: { onend: () => void } | null = null;
  vi.stubGlobal("window", { speechSynthesis: {
    cancel: () => { queued = null; },
    speak: (utterance: { onend: () => void }) => { queued = utterance; },
  } });
  vi.stubGlobal("SpeechSynthesisUtterance", class { constructor(public text: string) {} });
  let second: Promise<void> | undefined;
  const first = speakText("First", { onEnd: () => { second = speakText("Second"); } });
  stopSpeaking();
  await first;
  expect(queued).not.toBeNull();
  queued!.onend();
  await second;
});
