import { test, expect } from "../fixtures/e2e";
import { bootstrapOrganiserSession, buildOrganiserCredentials } from "../helpers/auth";

test("organiser can create a routine", async ({ page }) => {
  const credentials = buildOrganiserCredentials("routine-creation");
  const routineTitle = "Morning tea";

  await bootstrapOrganiserSession(page, credentials);
  await page.goto("/circle/add-routine");

  await page.getByTestId("routine-title-input").fill(routineTitle);
  await page.getByTestId("routine-time-input").fill("09:30");
  await page.getByTestId("routine-notes-input").fill(
    "Mention the blue mug during the prompt.",
  );
  await page.getByTestId("routine-save-button").click();

  await expect(page).toHaveURL(/\/circle\/routines$/);
  await expect(page.getByText(routineTitle)).toBeVisible();
});
