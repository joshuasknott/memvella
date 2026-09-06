import { test, expect } from "../fixtures/e2e";
import { bootstrapSeniorSession } from "../helpers/test-support";

test("tablet code supports typing and paste formatting", async ({ page }) => {
  await page.goto("/assisted/login");
  await page.getByLabel("Tablet code", { exact: true }).fill("12 34 56");
  await expect(page.getByLabel("Tablet code", { exact: true })).toHaveValue("123456");
  await expect(page.getByRole("button", { name: "Connect companion" })).toBeEnabled();
  await page.getByRole("button", { name: "Delete last digit" }).click();
  await expect(page.getByLabel("Tablet code", { exact: true })).toHaveValue("12345");
});

test("text conversation needs no microphone and restores keyboard focus", async ({ page }) => {
  await bootstrapSeniorSession(page, { experience: "assisted" });
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new Error("Text conversation requested a microphone");
    };
  });
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto("/assisted");
  const entry = page.getByRole("button", { name: "Type a message", exact: true });
  await entry.click();
  const dialog = page.getByRole("dialog", { name: "Text conversation" });
  await dialog.getByLabel("Your message").fill("I would like to talk about my garden.");
  await dialog.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(dialog.getByText("Thank you for sharing that with me.", { exact: true }).first()).toBeVisible();
  await expect(dialog.getByLabel("Your message")).toHaveValue("");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(entry).toBeFocused();
});
