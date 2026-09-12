import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildOrganiserCredentials,
} from "../helpers/auth";

test("memory search finds the full story and recovers from an empty result", async ({
  page,
}) => {
  await bootstrapOrganiserSession(
    page,
    buildOrganiserCredentials("memory-search"),
  );
  await page.goto("/circle/add-memory");
  await page.getByLabel("Give it a name").fill("A family afternoon");
  await page
    .getByLabel("The story")
    .fill(
      `${"We spent the afternoon together. ".repeat(12)}Then we walked through the orchard.`,
    );
  await page.getByRole("button", { name: "Save memory", exact: true }).click();
  await expect(page).toHaveURL(/\/circle\/memories$/);
  await page
    .getByRole("searchbox", { name: "Search memories" })
    .fill("orchard");
  await expect(page.getByTestId("memory-list-item")).toHaveCount(1);
  await expect(page.getByTestId("memory-list-item")).toContainText(
    "A family afternoon",
  );
  await page
    .getByRole("searchbox", { name: "Search memories" })
    .fill("unfindable");
  await expect(
    page.getByRole("heading", { name: "No matching memories" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.getByTestId("memory-list-item")).toHaveCount(1);
});
