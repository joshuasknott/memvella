import { test, expect } from "../fixtures/e2e";
import { bootstrapOrganiserSession, buildOrganiserCredentials } from "../helpers/auth";
import { seedAwarenessReviewFixture } from "../helpers/test-support";

test("owner can review and dismiss queued insights and alerts", async ({
  page,
  request,
}) => {
  const credentials = buildOrganiserCredentials("awareness-review");

  await bootstrapOrganiserSession(page, credentials);
  await seedAwarenessReviewFixture(request, { authEmail: credentials.email });
  await page.goto("/circle/insights");

  await expect(page.getByTestId("queued-insight-card")).toHaveCount(2);
  await page
    .getByTestId("queued-insight-card")
    .filter({ hasText: "Check the evening routine" })
    .getByTestId("mark-insight-reviewed-button")
    .click();
  await expect(page.getByTestId("reviewed-insight-card")).toContainText(
    "Check the evening routine",
  );
  await page
    .getByTestId("queued-insight-card")
    .filter({ hasText: "Ask about the garden photos" })
    .getByTestId("dismiss-insight-button")
    .click();

  await expect(page.getByTestId("queued-insight-card")).toHaveCount(0);
  await expect(page.getByTestId("reviewed-insight-card")).toHaveCount(1);
});

test("owner sees deterministic push unavailable state and saved notification toggles", async ({
  page,
}) => {
  const credentials = buildOrganiserCredentials("notification-settings");

  await bootstrapOrganiserSession(page, credentials);
  await page.goto("/circle/settings/notifications");

  await expect(page.getByTestId("push-not-configured-message")).toBeVisible();
  await expect(page.getByTestId("push-alerts-toggle-button")).toBeDisabled();

  const dailySummary = page.getByTestId("daily-summary-toggle");
  const urgentAlerts = page.getByTestId("urgent-alerts-toggle");
  const routineReminders = page.getByTestId("routine-reminders-toggle");

  await expect(dailySummary).toHaveAttribute("aria-checked", "true");
  await expect(urgentAlerts).toHaveAttribute("aria-checked", "true");
  await expect(routineReminders).toHaveAttribute("aria-checked", "false");

  await dailySummary.click();
  await expect(dailySummary).toHaveAttribute("aria-checked", "false");
  await routineReminders.click();
  await expect(routineReminders).toHaveAttribute("aria-checked", "true");

  await page.reload();
  await expect(page.getByTestId("daily-summary-toggle")).toHaveAttribute(
    "aria-checked",
    "false",
  );
  await expect(page.getByTestId("routine-reminders-toggle")).toHaveAttribute(
    "aria-checked",
    "true",
  );
});

test("reset password invalid token path is explicit in test mode", async ({ page }) => {
  await page.goto("/organiser/reset-password?token=expired-test-token");
  await page.getByTestId("new-password-input").fill("new-password-123");
  await page.getByTestId("confirm-password-input").fill("new-password-123");
  await page.getByTestId("password-reset-submit-button").click();

  await expect(
    page.getByText(/invalid|expired/i).first(),
  ).toBeVisible();

  await page.goto("/organiser/reset-password?error=expired");
  await expect(page.getByTestId("password-reset-invalid-link")).toBeVisible();
});
