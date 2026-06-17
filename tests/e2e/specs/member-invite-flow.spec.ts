import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildMemberCredentials,
  buildOrganiserCredentials,
  readInviteCode,
} from "../helpers/auth";
import { createTestContext, waitForCircleReady } from "../helpers/test-support";

test("a future Supporter can preview an invite code and join through the shipped UI", async ({
  browser,
  page,
}) => {
  const organiserCredentials = buildOrganiserCredentials("invite-ui-organiser");
  const memberCredentials = buildMemberCredentials("invite-ui-member");

  await bootstrapOrganiserSession(page, organiserCredentials);
  await page.goto("/circle/settings/invite");
  await page.getByTestId("generate-invite-code-button").click();
  const inviteCode = await readInviteCode(page);

  const memberContext = await createTestContext(browser);
  const memberPage = await memberContext.newPage();
  await memberPage.goto("/onboarding/member");
  for (const [index, digit] of [...inviteCode].entries()) {
    await memberPage.getByTestId(`member-code-digit-${index}`).fill(digit);
  }
  await memberPage.getByTestId("member-code-continue-button").click();
  await expect(memberPage.getByText(/You're joining David Workspace as a Supporter\./)).toBeVisible();

  await memberPage.getByTestId("member-create-account-button").click();
  await memberPage.getByTestId("member-name-input").fill(memberCredentials.name);
  await memberPage.getByTestId("member-email-input").fill(memberCredentials.email);
  await memberPage.getByTestId("member-password-input").fill(memberCredentials.password);
  await memberPage.getByTestId("member-auth-submit-button").click();

  await waitForCircleReady(memberPage);
  await expect(memberPage.getByTestId("circle-ready")).toHaveAttribute("data-role", "member");
  await memberContext.close();
});
