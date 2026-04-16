import type { Page } from "@playwright/test";

export async function installFakeAssistedLiveVoice(
  page: Page,
  options: {
    softCheckInPromptReply?: string;
    softCheckInResponseTranscript?: string;
    softCheckInResponseReply?: string;
  } = {},
) {
  await page.addInitScript((controls) => {
    window.__memvellaTestLiveVoice = {
      ...(window.__memvellaTestLiveVoice ?? {}),
      ...controls,
    };
  }, options);
}
