import { test, expect } from "../fixtures/e2e";
import { injectInvalidAssistedSession } from "../helpers/test-support";

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
