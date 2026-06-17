import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildOrganiserCredentials,
} from "../helpers/auth";

test("an account can sign out and protected Workspace routes return to sign in", async ({
  page,
}) => {
  const credentials = buildOrganiserCredentials("family-session");
  await bootstrapOrganiserSession(page, credentials);

  await page.goto("/circle/settings/account");
  await page.getByTestId("family-account-signout-button").click();
  await expect(page).toHaveURL(/\/organiser\/signin$/);

  await page.goto("/circle/settings");
  await expect(page).toHaveURL(/\/organiser\/signin\?next=%2Fcircle%2Fsettings$/);
});
