import { test, expect } from "../fixtures/e2e";
import { bootstrapOrganiserSession, buildOrganiserCredentials } from "../helpers/auth";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
  "base64",
);

const tinyWav = Buffer.from(
  "UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=",
  "base64",
);

test("organiser can upload a media memory and open its detail", async ({ page }) => {
  const credentials = buildOrganiserCredentials("media-memory");
  const title = "Garden photo afternoon";

  await bootstrapOrganiserSession(page, credentials);
  await page.goto("/circle/add-memory/media");
  await page.getByTestId("media-memory-file-input").setInputFiles({
    name: "garden.png",
    mimeType: "image/png",
    buffer: tinyPng,
  });
  await page.getByTestId("media-memory-title-input").fill(title);
  await page.getByTestId("media-memory-date-input").fill("2026-07-01");
  await page.getByTestId("media-memory-story-input").fill("A sunny moment beside the patio planters.");
  await page.getByTestId("media-memory-save-button").click();

  await expect(page).toHaveURL(/\/circle\/memories$/);
  await expect(page.getByTestId("memory-list")).toContainText(title);
  await page.getByTestId("memory-list-item").filter({ hasText: title }).click();
  await expect(page.getByTestId("memory-detail-title")).toContainText(title);
  await expect(page.getByText("A sunny moment beside the patio planters.")).toBeVisible();
});

test("organiser can create an audio memory with a link and uploaded file", async ({
  page,
}) => {
  const credentials = buildOrganiserCredentials("audio-memory");
  const title = "Wedding song";

  await bootstrapOrganiserSession(page, credentials);
  await page.goto("/circle/add-memory/audio");
  await page.getByTestId("audio-memory-title-input").fill(title);
  await page.getByTestId("audio-memory-date-input").fill("2026-06-20");
  await page.getByTestId("audio-memory-link-input").fill("https://example.com/wedding-song");
  await page.getByTestId("audio-memory-story-input").fill("This song played during the first dance.");
  await page.getByTestId("audio-memory-file-input").setInputFiles({
    name: "song.wav",
    mimeType: "audio/wav",
    buffer: tinyWav,
  });
  await page.getByTestId("audio-memory-save-button").click();

  await expect(page).toHaveURL(/\/circle\/memories$/);
  await expect(page.getByTestId("memory-list")).toContainText(title);
  await page.getByTestId("memory-list-item").filter({ hasText: title }).click();
  await expect(page.getByTestId("memory-detail-title")).toContainText(title);
  await expect(page.getByRole("link", { name: "Open link" })).toHaveAttribute(
    "href",
    "https://example.com/wedding-song",
  );
});

test("organiser can edit and delete a text memory", async ({ page }) => {
  const credentials = buildOrganiserCredentials("memory-crud");

  await bootstrapOrganiserSession(page, credentials);
  await page.goto("/circle/add-memory/text");
  await page.getByTestId("text-memory-title-input").fill("Seaside picnic");
  await page.getByTestId("text-memory-date-input").fill("2026-05-12");
  await page.getByTestId("text-memory-story-input").fill("Fish and chips by the sea.");
  await page.getByTestId("text-memory-save-button").click();

  await expect(page).toHaveURL(/\/circle\/memories$/);
  await page.getByTestId("memory-list-item").filter({ hasText: "Seaside picnic" }).click();
  await page.getByRole("link", { name: /Edit memory/ }).click();
  await page.getByTestId("memory-edit-title-input").fill("Seaside picnic updated");
  await page.getByTestId("memory-edit-date-input").fill("2026-05-13");
  await page.getByTestId("memory-edit-story-input").fill("Fish, chips, and a long walk by the pier.");
  await page.getByTestId("memory-edit-save-button").click();

  await expect(page.getByTestId("memory-detail-title")).toContainText(
    "Seaside picnic updated",
  );
  await expect(page.getByText("Fish, chips, and a long walk by the pier.")).toBeVisible();
  await page.getByTestId("delete-memory-button").click();
  await page.getByTestId("confirm-delete-memory-button").click();

  await expect(page).toHaveURL(/\/circle\/memories$/);
  await expect(
    page
      .getByTestId("memory-list-item")
      .filter({ hasText: "Seaside picnic updated" }),
  ).toHaveCount(0);
});
