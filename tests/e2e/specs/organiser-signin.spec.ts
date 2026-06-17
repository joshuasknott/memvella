import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildOrganiserCredentials,
  signOutFamilyAccount,
} from "../helpers/auth";
import { waitForCircleReady } from "../helpers/test-support";

test("account holder can sign back into an existing Workspace", async ({ page }) => {
  const credentials = buildOrganiserCredentials("organiser-signin");

  await bootstrapOrganiserSession(page, credentials);
  await signOutFamilyAccount(page);

  await page.goto("/organiser/signin");
  await page.getByTestId("organiser-signin-email-input").fill(
    credentials.email,
  );
  await page.getByTestId("organiser-signin-password-input").fill(
    credentials.password,
  );
  await page.getByTestId("organiser-signin-submit-button").click();

  await waitForCircleReady(page);
  await expect(page).toHaveURL(/\/circle$/);
  await expect(page.getByTestId("circle-current-status")).toContainText(
    credentials.seniorName,
  );
});
