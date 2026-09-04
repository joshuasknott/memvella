import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildOrganiserCredentials,
} from "../helpers/auth";
import { createTestContext } from "../helpers/test-support";

test("due reminders wait for a tap and unavailable voice can be dismissed", async ({
  browser,
  page,
}) => {
  await bootstrapOrganiserSession(
    page,
    buildOrganiserCredentials("calm-reminder"),
  );
  await page.goto("/circle/add-routine");
  await page.getByTestId("routine-title-input").fill("A cup of tea");
  await page.getByTestId("routine-time-input").fill("00:00");
  await page.getByTestId("routine-save-button").click();
  await expect(page).toHaveURL(/\/circle\/routines$/);
  await page.goto("/circle/settings/pairing");
  await page.getByTestId("generate-pairing-code-button").click();
  const code = (await page
    .getByTestId("active-pairing-code")
    .textContent())!.replace(/\D/g, "");
  const tabletContext = await createTestContext(browser);
  await tabletContext.addInitScript(() => {
    window.__memvellaTestLiveVoice = {
      connectError: "Voice is unavailable in this test",
    };
  });
  const tablet = await tabletContext.newPage();
  await tablet.goto("/assisted/login");
  for (const digit of code)
    await tablet.getByRole("button", { name: digit, exact: true }).click();
  await tablet.getByTestId("assisted-connect-button").click();
  await expect(
    tablet.getByText("A gentle reminder", { exact: true }),
  ).toBeVisible();
  await expect(
    tablet.getByRole("dialog", { name: "Voice conversation" }),
  ).toHaveCount(0);
  await tablet
    .getByRole("button", { name: "Tap to talk", exact: true })
    .click();
  const dialog = tablet.getByRole("dialog", { name: "Voice conversation" });
  await expect(dialog).toContainText("We can’t connect right now");
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await tablet.reload();
  await expect(
    tablet.getByText("A gentle reminder", { exact: true }),
  ).toBeVisible();
  await expect(dialog).toHaveCount(0);
  await tabletContext.close();
});
