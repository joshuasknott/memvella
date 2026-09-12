import { test, expect } from "../fixtures/e2e";
import {
  bootstrapSeniorSession,
  injectInvalidAssistedSession,
} from "../helpers/test-support";

test("assisted experience falls back to reconnect when the session is invalid", async ({
  page,
}) => {
  await injectInvalidAssistedSession(page);
  await page.goto("/assisted");

  await expect(page.getByTestId("assisted-recovery-state")).toBeVisible();
  await expect(page.getByTestId("assisted-recovery-state")).toContainText(
    "Tablet code expired.",
  );
  await expect(page.getByTestId("assisted-recovery-cta")).toHaveAttribute(
    "href",
    "/assisted/login",
  );
});

test("a temporary offline period keeps the tablet paired and shows connection feedback", async ({
  page,
  context,
}) => {
  await bootstrapSeniorSession(page, { experience: "assisted" });
  await page.goto("/assisted");
  await expect(
    page.getByRole("button", { name: "Tap to talk", exact: true }),
  ).toBeVisible();
  const session = await page.evaluate(() =>
    localStorage.getItem("memvella_assisted_senior_session"),
  );
  await context.setOffline(true);
  await expect(
    page
      .getByRole("status", { name: "" })
      .filter({ hasText: "Reconnecting to Memvella" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      localStorage.getItem("memvella_assisted_senior_session"),
    ),
  ).toBe(session);
  await context.setOffline(false);
  await expect(
    page.getByText(
      "Reconnecting to Memvella. Some information may be out of date.",
    ),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Tap to talk", exact: true }),
  ).toBeVisible();
});

test("tablet preparation errors offer a retry without deleting the session", async ({
  page,
}) => {
  await bootstrapSeniorSession(page, { experience: "assisted" });
  await page.addInitScript(() => {
    const getItem = Storage.prototype.getItem;
    let blocked = true;
    Storage.prototype.getItem = function (key) {
      if (key === "memvella_assisted_senior_session" && blocked) {
        blocked = false;
        throw new DOMException(
          "Site storage temporarily unavailable",
          "SecurityError",
        );
      }
      return getItem.call(this, key);
    };
  });
  await page.goto("/assisted");
  await expect(
    page.getByRole("heading", { name: "Let’s try connecting again." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Tap to talk", exact: true }),
  ).toBeVisible();
});
