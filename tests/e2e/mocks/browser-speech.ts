import type { Page } from "@playwright/test";

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
