import { test, expect } from "../fixtures/e2e";
import { bootstrapOrganiserSession, buildOrganiserCredentials } from "../helpers/auth";
import { createTestContext } from "../helpers/test-support";

test("owner can pair a companion tablet and revoke access", async ({
  browser,
  page,
}) => {
  const credentials = buildOrganiserCredentials("assisted-pairing");

  await bootstrapOrganiserSession(page, credentials);
  await page.goto("/circle/settings/pairing");
  await page.getByTestId("generate-pairing-code-button").click();
  const pairingCode = (await page.getByTestId("active-pairing-code").textContent())
    ?.replace(/\D/g, "");
  expect(pairingCode).toMatch(/^\d{6}$/);

  const tabletContext = await createTestContext(browser);
  const tabletPage = await tabletContext.newPage();
  await tabletPage.goto("/assisted/login");
  for (const digit of pairingCode ?? "") {
    await tabletPage.getByRole("button", { name: digit }).click();
  }
  await tabletPage.getByTestId("assisted-connect-button").click();

  await expect(tabletPage).toHaveURL(/\/assisted$/);
  await expect(tabletPage.getByText(credentials.seniorName)).toBeVisible();
  await tabletPage.reload();
  await expect(tabletPage).toHaveURL(/\/assisted$/);
  await expect(tabletPage.getByText(credentials.seniorName)).toBeVisible();

  await page.goto("/circle/settings/pairing");
  await page.getByTestId("revoke-all-pairing-access-button").click();
  await expect(page.getByText("No active companion tablet sessions")).toBeVisible();

  await tabletPage.reload();
  await expect(tabletPage.getByTestId("assisted-recovery-state")).toBeVisible();

  await tabletContext.close();
});
