import type { Page } from "@playwright/test";
import type {
  BrowserSpeechRecognitionEventLike,
  BrowserSpeechRecognitionInstance,
} from "../../../apps/core/lib/browser-speech";

type ControlledRecognition = BrowserSpeechRecognitionInstance & {
  abortCalls: number;
  stopCalls: number;
  queued: Pick<BrowserSpeechRecognitionInstance, "onstart" | "onresult" | "onerror" | "onend">;
};

declare global {
  interface Window {
    __memvellaDictationTest: { instances: ControlledRecognition[] };
  }
}

type SpeechEvent =
  | { type: "start" | "end" }
  | { type: "error"; error: string }
  | { type: "result"; result: BrowserSpeechRecognitionEventLike };

/** Exercise delayed, revised, and out-of-order browser events without a microphone. */
export async function installControlledSpeechRecognition(
  page: Page,
  options: { delayStart?: boolean; throwOnStop?: boolean; throwOnStart?: boolean } = {},
) {
  await page.addInitScript((settings) => {
    window.__memvellaDictationTest = { instances: [] };
    class ControlledSpeechRecognition implements BrowserSpeechRecognitionInstance {
      lang = "";
      interimResults = true;
      continuous = true;
      onstart: BrowserSpeechRecognitionInstance["onstart"] = null;
      onresult: BrowserSpeechRecognitionInstance["onresult"] = null;
      onerror: BrowserSpeechRecognitionInstance["onerror"] = null;
      onend: BrowserSpeechRecognitionInstance["onend"] = null;
      abortCalls = 0;
      stopCalls = 0;
      queued: ControlledRecognition["queued"] = {
        onstart: null, onresult: null, onerror: null, onend: null,
      };

      start() {
        window.__memvellaDictationTest.instances.push(this);
        this.queued = {
          onstart: this.onstart,
          onresult: this.onresult,
          onerror: this.onerror,
          onend: this.onend,
        };
        if (settings.throwOnStart) throw new Error("Speech startup failed");
        if (!settings.delayStart) this.onstart?.();
      }

      stop() {
        this.stopCalls += 1;
        if (settings.throwOnStop) throw new Error("Speech stop failed");
      }

      abort() {
        this.abortCalls += 1;
      }
    }
    window.__memvellaTestSpeech = {
      ...window.__memvellaTestSpeech,
      speechRecognitionCtor: ControlledSpeechRecognition,
    };
  }, options);

  return {
    emit: (event: SpeechEvent, options: { instance?: number; queued?: boolean } = {}) =>
      page.evaluate(({ event, options }) => {
        const instances = window.__memvellaDictationTest.instances;
        const instance = instances[options.instance ?? instances.length - 1];
        const handlers = options.queued ? instance.queued : instance;
        switch (event.type) {
          case "start": handlers.onstart?.(); break;
          case "end": handlers.onend?.(); break;
          case "error": handlers.onerror?.({ error: event.error }); break;
          case "result": handlers.onresult?.(event.result); break;
        }
      }, { event, options }),
    calls: (index = 0) => page.evaluate((index) => {
      const instance = window.__memvellaDictationTest.instances[index];
      return { abort: instance.abortCalls, stop: instance.stopCalls };
    }, index),
  };
}

export async function installFakeSpeechRecognition(
  page: Page,
  transcript: string,
) {
  await page.addInitScript((finalTranscript) => {
    class FakeSpeechRecognition {
      lang = "en-GB";
      interimResults = true;
      continuous = true;
      onstart = null;
      onresult = null;
      onerror = null;
      onend = null;
      hasEnded = false;

      start() {
        this.onstart?.();
        this.onresult?.({
          resultIndex: 0,
          results: [
            {
              0: {
                transcript: finalTranscript,
              },
              isFinal: true,
            },
          ],
        });
        this.finish();
      }

      stop() {
        this.finish();
      }

      abort() {
        this.finish();
      }

      finish() {
        if (this.hasEnded) {
          return;
        }

        this.hasEnded = true;
        this.onend?.();
      }
    }

    window.__memvellaTestSpeech = {
      ...(window.__memvellaTestSpeech ?? {}),
      instantSpeechSynthesis: true,
      speechRecognitionCtor: FakeSpeechRecognition,
    };
  }, transcript);
}
