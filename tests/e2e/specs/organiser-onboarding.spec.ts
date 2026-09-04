import { test, expect } from "../fixtures/e2e";
import { buildOrganiserCredentials } from "../helpers/auth";
import { waitForCircleReady } from "../helpers/test-support";

test("account onboarding creates a Workspace", async ({ page }) => {
  const credentials = buildOrganiserCredentials("organiser-onboarding");

  await page.goto("/");
  await page.locator("#btn-start-circle").click();

  await page.getByTestId("organiser-name-input").fill(credentials.name);
  await page.getByTestId("organiser-senior-name-input").fill(
    credentials.seniorName,
  );
  await page.getByTestId("organiser-email-input").fill(credentials.email);
  await page.getByTestId("organiser-password-input").fill(
    credentials.password,
  );
  await page.getByTestId("organiser-submit-button").click();

  await waitForCircleReady(page);
  await expect(page).toHaveURL(/\/circle$/);
  await expect(page.locator(".companion-card")).toContainText(
    credentials.seniorName,
  );
});
