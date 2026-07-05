import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildMemberCredentials,
  buildOrganiserCredentials,
  joinMemberViaInvite,
  readInviteCode,
} from "../helpers/auth";
import { createTestContext } from "../helpers/test-support";

test("member access stays inside member permissions", async ({ browser, page }) => {
  const organiserCredentials = buildOrganiserCredentials("member-auth-organiser");
  const memberCredentials = buildMemberCredentials("member-auth-member");

  await bootstrapOrganiserSession(page, organiserCredentials);
  await page.goto("/circle/settings/invite");
  await page.getByTestId("generate-invite-code-button").click();
  const inviteCode = await readInviteCode(page);

  const memberContext = await createTestContext(browser);
  const memberPage = await memberContext.newPage();

  await joinMemberViaInvite(memberPage, inviteCode, memberCredentials);
  await memberPage.goto("/circle/settings/members");
  await expect(memberPage).toHaveURL(/\/circle\/settings\/members$/);
  await expect(
    memberPage.getByRole("main").getByRole("heading", { name: "Supporters" }),
  ).toBeVisible();

  await memberPage.goto("/circle/settings/invite");
  await expect(memberPage.getByTestId("invite-settings-restricted")).toBeVisible();

  await memberPage.goto("/circle/settings/pairing");
  await expect(memberPage.getByTestId("pairing-settings-restricted")).toBeVisible();

  await memberContext.close();
});
