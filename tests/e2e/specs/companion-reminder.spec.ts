import { test, expect } from "../fixtures/e2e";
import { bootstrapSeniorSession } from "../helpers/test-support";

test("due reminders wait for a tap and unavailable voice can be dismissed", async ({
  page: tablet,
}) => {
  // Seed an already-due occurrence without relying on replaying a past schedule.
  await bootstrapSeniorSession(tablet, {
    experience: "assisted",
    seniorName: "David",
    dueRoutineTitle: "A cup of tea",
  });
  await tablet.addInitScript(() => {
    window.__memvellaTestLiveVoice = {
      connectError: "Voice is unavailable in this test",
    };
  });
  await tablet.goto("/assisted");
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
});
