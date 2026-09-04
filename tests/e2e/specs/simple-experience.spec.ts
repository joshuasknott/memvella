import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildOrganiserCredentials,
} from "../helpers/auth";

test("one memory editor validates, saves, and searches at phone size", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await bootstrapOrganiserSession(
    page,
    buildOrganiserCredentials("simple-memory"),
  );
  await page.getByTestId("circle-add-memory-action").click();
  await expect(
    page.getByRole("heading", { name: "Add a memory" }),
  ).toBeVisible();
  await page
    .getByTestId("text-memory-title-input")
    .fill("Sunday in the garden");
  await page.getByTestId("text-memory-save-button").click();
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "a few words",
  );
  await page
    .getByTestId("text-memory-story-input")
    .fill("We planted the roses together.");
  await page
    .getByTestId("text-memory-file-input")
    .setInputFiles({
      name: "invalid.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("unsupported"),
    });
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "allowed",
  );
  await expect(page.getByTestId("text-memory-story-input")).toHaveValue(
    "We planted the roses together.",
  );
  await page.getByTestId("text-memory-save-button").click();
  await expect(page).toHaveURL(/\/circle\/memories$/);
  await page.getByRole("searchbox", { name: "Search memories" }).fill("roses");
  await expect(page.getByTestId("memory-list-item")).toHaveCount(1);
  await page
    .getByRole("searchbox", { name: "Search memories" })
    .fill("missing phrase");
  await expect(
    page.getByRole("heading", { name: "No matching memories" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByTestId("memory-list-item")).toHaveCount(1);
  const width = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(width.content).toBeLessThanOrEqual(width.viewport);
  await expect(page.getByTestId("circle-nav-memories")).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("account name edits persist without duplicating tablet controls", async ({
  page,
}) => {
  await bootstrapOrganiserSession(
    page,
    buildOrganiserCredentials("account-details"),
  );
  await page.goto("/circle/settings/account");
  await page.getByLabel("Who are you supporting?").fill("Margaret");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Details saved", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Who are you supporting?")).toHaveValue(
    "Margaret",
  );
  await expect(page.getByRole("button", { name: /Revoke all/ })).toHaveCount(0);
  await page.getByTestId("circle-nav-home").click();
  await expect(page.locator(".companion-card")).toContainText("Margaret");
});
