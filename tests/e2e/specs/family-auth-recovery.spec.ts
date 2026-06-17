import { test, expect } from "../fixtures/e2e";
import { buildOrganiserCredentials } from "../helpers/auth";

test("family-side sign-in exposes a non-enumerating password recovery request", async ({
  page,
}) => {
  const credentials = buildOrganiserCredentials("recovery-request");

  await page.goto("/organiser/signin");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.getByTestId("password-recovery-email-input").fill(credentials.email);
  await page.getByTestId("password-recovery-submit-button").click();

  await expect(page.getByTestId("password-reset-requested")).toContainText(
    "If that email belongs to an account",
  );
});
