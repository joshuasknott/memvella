import { test, expect } from "../fixtures/e2e";
import { bootstrapOrganiserSession, buildOrganiserCredentials } from "../helpers/auth";
import { installFakeSpeechRecognition } from "../mocks/browser-speech";

test("organiser can save a voice-dictated memory", async ({ page }) => {
  const credentials = buildOrganiserCredentials("voice-memory");
  const memoryTitle = "The seaside trip";
  const dictatedTranscript = "We laughed by the seaside and shared fish and chips.";

  await bootstrapOrganiserSession(page, credentials);
  await installFakeSpeechRecognition(page, dictatedTranscript);
  await page.goto("/circle/add-memory/voice");

  await page.getByTestId("voice-memory-title-input").fill(memoryTitle);
  await page.getByTestId("voice-memory-record-button").click();
  await expect(page.getByTestId("voice-memory-transcript-input")).toHaveValue(
    dictatedTranscript,
  );
  await page.getByTestId("voice-memory-save-button").click();

  await expect(page).toHaveURL(/\/circle\/memories$/);
  await expect(page.getByText(memoryTitle)).toBeVisible();
});
