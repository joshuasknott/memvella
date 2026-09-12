import { test, expect } from "../fixtures/e2e";
import { bootstrapOrganiserSession, buildOrganiserCredentials } from "../helpers/auth";
import { installControlledSpeechRecognition, installFakeSpeechRecognition } from "../mocks/browser-speech";

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
  await expect(
    page.getByTestId("memory-list-item").filter({ hasText: memoryTitle }),
  ).toBeVisible();
});

test("dictation keeps unchanged interim words, replaces revisions, and appends to an edited story", async ({ page }) => {
  await bootstrapOrganiserSession(page, buildOrganiserCredentials("dictation-results"));
  const speech = await installControlledSpeechRecognition(page);
  await page.goto("/circle/add-memory/voice");
  const story = page.getByTestId("voice-memory-transcript-input");
  const record = page.getByTestId("voice-memory-record-button");
  await page.getByLabel("Give it a name").fill("The remembered seaside trip");
  await story.fill("A summer memory.\n\n");
  await record.click();

  const first = { 0: { transcript: "We went " }, isFinal: true };
  const second = { 0: { transcript: "to the sea " }, isFinal: false };
  await speech.emit({ type: "result", result: {
    resultIndex: 0,
    results: [first, second, { 0: { transcript: "on Monday" }, isFinal: false }],
  } });
  await speech.emit({ type: "result", result: {
    resultIndex: 2,
    results: [first, second, { 0: { transcript: "on Sunday" }, isFinal: false }],
  } });
  await expect(story).toHaveValue("A summer memory.\n\nWe went to the sea on Sunday");
  await speech.emit({ type: "result", result: { resultIndex: 2, results: [first, second] } });
  await expect(story).toHaveValue("A summer memory.\n\nWe went to the sea");
  const final = [first, { 0: { transcript: "to the seaside." }, isFinal: true }];
  await speech.emit({ type: "result", result: { resultIndex: 1, results: final } });
  await speech.emit({ type: "end" });
  await expect(story).toBeEditable();
  await story.fill("A summer memory.\n\nWe went to the seaside. Dad came too.");
  await record.click();
  await speech.emit({ type: "result", result: {
    resultIndex: 0,
    results: [{ 0: { transcript: "We shared fish and chips." }, isFinal: true }],
  } });
  await speech.emit({ type: "end" });
  await expect(story).toHaveValue("A summer memory.\n\nWe went to the seaside. Dad came too. We shared fish and chips.");
  await page.getByTestId("voice-memory-save-button").click();
  await expect(page).toHaveURL(/\/circle\/memories$/);
  await page.getByRole("searchbox", { name: "Search memories" }).fill("Dad came too");
  await expect(page.getByTestId("memory-list-item")).toContainText("The remembered seaside trip");
});

test("microphone startup can be cancelled on a narrow screen without late events changing the story", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await bootstrapOrganiserSession(page, buildOrganiserCredentials("dictation-cancel"));
  const speech = await installControlledSpeechRecognition(page, { delayStart: true });
  await page.goto("/circle/add-memory/voice");
  const story = page.getByTestId("voice-memory-transcript-input");
  await page.getByLabel("Give it a name").fill("A family story");
  await story.fill("Keep this story.\n\n");
  await page.getByTestId("voice-memory-record-button").click();
  await expect(page.getByRole("status").filter({ hasText: "Waiting for microphone" })).toBeVisible();
  await expect(page.getByTestId("voice-memory-save-button")).toBeDisabled();
  await page.getByRole("button", { name: "Cancel dictation" }).focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Cancel dictation" })).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath("dictation-starting-phone.png") });
  await page.getByRole("button", { name: "Cancel dictation" }).press("Enter");
  await expect(story).toBeEditable();
  expect(await speech.calls()).toEqual({ abort: 1, stop: 0 });
  await story.fill("An edited family story.");
  await speech.emit({ type: "start" }, { queued: true });
  await speech.emit({ type: "result", result: {
    results: [{ 0: { transcript: "Old words" }, isFinal: true }],
  } }, { queued: true });
  await speech.emit({ type: "end" }, { queued: true });
  await expect(story).toHaveValue("An edited family story.");
  await expect(story).toBeEditable();
  await expect(page.getByTestId("voice-memory-save-button")).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("speech errors unlock editing and stale callbacks cannot interrupt a retry", async ({ page }, testInfo) => {
  await bootstrapOrganiserSession(page, buildOrganiserCredentials("dictation-error"));
  const speech = await installControlledSpeechRecognition(page);
  await page.goto("/circle/add-memory/voice");
  const story = page.getByTestId("voice-memory-transcript-input");
  const record = page.getByTestId("voice-memory-record-button");
  await page.getByLabel("Give it a name").fill("Sunday lunch");
  await record.click();
  await speech.emit({ type: "result", result: {
    results: [{ 0: { transcript: "We cooked together." }, isFinal: false }],
  } });
  await speech.emit({ type: "error", error: "network" });
  await expect(story).toBeEditable();
  await expect(story).toHaveValue("We cooked together.");
  await expect(page.getByRole("main").getByRole("alert")).toContainText("Try again");
  await page.screenshot({ path: testInfo.outputPath("dictation-error-desktop.png"), fullPage: true });
  await story.fill("We cooked Sunday lunch together.");
  await record.click();
  await speech.emit({ type: "end" }, { instance: 0, queued: true });
  await speech.emit({ type: "error", error: "not-allowed" }, { instance: 0, queued: true });
  await speech.emit({ type: "result", result: {
    results: [{ 0: { transcript: "Stale words" }, isFinal: true }],
  } }, { instance: 0, queued: true });
  await expect(story).not.toBeEditable();
  await expect(story).toHaveValue("We cooked Sunday lunch together.");
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await speech.emit({ type: "result", result: {
    results: [{ 0: { transcript: "Everyone enjoyed it." }, isFinal: true }],
  } });
  await speech.emit({ type: "end" });
  await expect(story).toHaveValue("We cooked Sunday lunch together. Everyone enjoyed it.");
  await expect(story).toBeEditable();
});

test("stopping waits for the final words before allowing a save", async ({ page }) => {
  await bootstrapOrganiserSession(page, buildOrganiserCredentials("dictation-final"));
  const speech = await installControlledSpeechRecognition(page);
  await page.goto("/circle/add-memory/voice");
  await page.getByLabel("Give it a name").fill("The seaside");
  const story = page.getByTestId("voice-memory-transcript-input");
  const record = page.getByTestId("voice-memory-record-button");
  await record.click();
  await speech.emit({ type: "result", result: {
    results: [{ 0: { transcript: "We visited" }, isFinal: false }],
  } });
  await record.click();
  await expect(record).toHaveText("Finishing…");
  await expect(story).not.toBeEditable();
  await expect(page.getByTestId("voice-memory-save-button")).toBeDisabled();
  await speech.emit({ type: "result", result: {
    results: [{ 0: { transcript: "We visited the seaside." }, isFinal: true }],
  } });
  await speech.emit({ type: "end" });
  await expect(story).toHaveValue("We visited the seaside.");
  await expect(page.getByTestId("voice-memory-save-button")).toBeEnabled();
  expect(await speech.calls()).toEqual({ abort: 0, stop: 1 });
});

for (const throwOnStop of [false, true]) {
  test(`a ${throwOnStop ? "throwing" : "stalled"} speech stop preserves words and releases the editor`, async ({ page }) => {
    await bootstrapOrganiserSession(page, buildOrganiserCredentials("dictation-stop"));
    const speech = await installControlledSpeechRecognition(page, { throwOnStop });
    await page.goto("/circle/add-memory/voice");
    const story = page.getByTestId("voice-memory-transcript-input");
    const record = page.getByTestId("voice-memory-record-button");
    await record.click();
    await speech.emit({ type: "result", result: {
      results: [{ 0: { transcript: "A lovely afternoon." }, isFinal: false }],
    } });
    await record.click();
    await expect(story).toBeEditable();
    await expect(story).toHaveValue("A lovely afternoon.");
    expect(await speech.calls()).toEqual({ abort: 1, stop: 1 });
    await story.fill("A lovely afternoon in the garden.");
    await speech.emit({ type: "end" }, { queued: true });
    await expect(story).toHaveValue("A lovely afternoon in the garden.");
  });
}

test("failed startup detaches speech callbacks", async ({ page }) => {
  await bootstrapOrganiserSession(page, buildOrganiserCredentials("dictation-start-error"));
  const speech = await installControlledSpeechRecognition(page, { throwOnStart: true });
  await page.goto("/circle/add-memory/voice");
  const story = page.getByTestId("voice-memory-transcript-input");
  await story.fill("Keep my original words.");
  await page.getByTestId("voice-memory-record-button").click();
  await expect(story).toBeEditable();
  await story.fill("Keep my edited words.");
  await speech.emit({ type: "start" }, { queued: true });
  await speech.emit({ type: "end" }, { queued: true });
  await expect(story).toHaveValue("Keep my edited words.");
  expect(await speech.calls()).toEqual({ abort: 1, stop: 0 });
});

test("leaving the editor aborts active dictation and ignores queued events", async ({ page }) => {
  await bootstrapOrganiserSession(page, buildOrganiserCredentials("dictation-leave"));
  const speech = await installControlledSpeechRecognition(page);
  await page.goto("/circle/add-memory/voice");
  await page.getByTestId("voice-memory-record-button").click();
  await expect(page.getByRole("button", { name: "Stop dictation" })).toBeVisible();
  await page.getByRole("link", { name: "Cancel", exact: true }).click();
  await expect(page).toHaveURL(/\/circle\/memories$/);
  expect(await speech.calls()).toEqual({ abort: 1, stop: 0 });
  await page.getByRole("link", { name: "Add a memory", exact: true }).click();
  const story = page.getByTestId("text-memory-story-input");
  await story.fill("A fresh story.");
  await speech.emit({ type: "result", result: {
    results: [{ 0: { transcript: "Old words" }, isFinal: true }],
  } }, { queued: true });
  await speech.emit({ type: "end" }, { queued: true });
  await expect(story).toHaveValue("A fresh story.");
});
