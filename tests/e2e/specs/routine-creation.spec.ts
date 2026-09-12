import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildOrganiserCredentials,
} from "../helpers/auth";

test("organiser can create a routine", async ({ page }) => {
  const credentials = buildOrganiserCredentials("routine-creation");
  const routineTitle = "Morning tea";

  await bootstrapOrganiserSession(page, credentials);
  await page.goto("/circle/add-routine");

  await page.getByTestId("routine-title-input").fill(routineTitle);
  await page.getByTestId("routine-time-input").fill("09:30");
  await page
    .getByTestId("routine-notes-input")
    .fill("Mention the blue mug during the prompt.");
  await page.getByTestId("routine-save-button").click();

  await expect(page).toHaveURL(/\/circle\/routines$/);
  await expect(
    page
      .locator('[data-testid^="routine-card-"]')
      .filter({ hasText: routineTitle }),
  ).toBeVisible();
});

test("owner can edit, pause, resume and delete a routine from a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await bootstrapOrganiserSession(
    page,
    buildOrganiserCredentials("routine-management"),
  );
  await page.goto("/circle/add-routine");
  await page.getByTestId("routine-title-input").fill("Garden walk");
  await page.getByTestId("routine-time-input").fill("14:00");
  await page.getByTestId("routine-save-button").click();
  await page.getByRole("link", { name: "Edit Garden walk" }).click();
  await expect(page.getByTestId("routine-time-input")).toHaveValue("14:00");
  await page.getByTestId("routine-title-input").fill("Afternoon walk");
  await page.getByTestId("routine-time-input").fill("15:30");
  await page.getByRole("button", { name: "Weekdays", exact: true }).click();
  await page.getByRole("checkbox", { name: /Pause reminders/ }).check();
  await page.getByTestId("routine-save-button").click();
  const routine = page
    .locator('[data-testid^="routine-card-"]')
    .filter({ hasText: "Afternoon walk" });
  await expect(routine).toContainText("3:30 PM");
  await expect(routine).toContainText("Weekdays · paused");
  await page.getByRole("link", { name: "Edit Afternoon walk" }).click();
  await expect(
    page.getByRole("checkbox", { name: /Pause reminders/ }),
  ).toBeChecked();
  await page.getByRole("checkbox", { name: /Pause reminders/ }).uncheck();
  await page.getByTestId("routine-save-button").click();
  await expect(routine).not.toContainText("paused");
  await page.getByRole("link", { name: "Edit Afternoon walk" }).click();
  const deleteButton = page.getByRole("button", {
    name: "Delete routine",
    exact: true,
  });
  await deleteButton.click();
  const dialog = page.getByRole("dialog", { name: "Delete this routine?" });
  await expect(
    dialog.getByRole("button", { name: "Keep routine" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(deleteButton).toBeFocused();
  await deleteButton.click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await dialog
    .getByRole("button", { name: "Delete routine", exact: true })
    .click();
  await expect(page).toHaveURL(/\/circle\/routines$/);
  await expect(routine).toHaveCount(0);
});
