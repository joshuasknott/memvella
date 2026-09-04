import { test, expect } from "../fixtures/e2e";
import {
  bootstrapOrganiserSession,
  buildMemberCredentials,
  buildOrganiserCredentials,
  joinMemberViaInvite,
  readInviteCode,
} from "../helpers/auth";
import { createTestContext } from "../helpers/test-support";

test("organiser can manage People records", async ({ page }) => {
  const credentials = buildOrganiserCredentials("people-crud-organiser");

  await bootstrapOrganiserSession(page, credentials);

  await page.getByTestId("circle-nav-settings").click();
  await page.getByRole("link", { name: /Familiar people/ }).click();
  await expect(page).toHaveURL(/\/circle\/people$/);
  await expect(page.getByTestId("people-empty-state")).toBeVisible();

  await page.getByTestId("people-add-person-link").click();
  await expect(page).toHaveURL(/\/circle\/add-person$/);
  await page.getByTestId("person-name-input").fill("Anna Cooper");
  await page.getByTestId("person-context-input").fill(
    "Anna visits on Fridays and talks about the garden.",
  );
  await page.getByTestId("person-save-button").click();

  await expect(page).toHaveURL(/\/circle\/people$/);
  await expect(page.getByTestId("people-list")).toContainText("Anna Cooper");
  await page
    .getByTestId("people-list")
    .getByRole("link")
    .filter({ hasText: "Anna Cooper" })
    .click();

  await expect(page.getByTestId("person-detail")).toContainText("Anna Cooper");
  await page.getByRole("link", { name: /Edit Person/ }).click();
  await page.getByTestId("person-edit-name-input").fill("Anna Cooper-Smith");
  await page.getByTestId("person-edit-context-input").fill(
    "Anna Cooper-Smith visits on Fridays and brings garden photos.",
  );
  await page.getByTestId("person-edit-save-button").click();

  await expect(page.getByTestId("person-detail")).toContainText(
    "Anna Cooper-Smith",
  );
  await page.getByTestId("delete-person-button").click();
  await page.getByTestId("confirm-delete-person-button").click();

  await expect(page).toHaveURL(/\/circle\/people$/);
  await expect(page.getByTestId("people-empty-state")).toBeVisible();
});

test("member can view People but cannot mutate them", async ({ browser, page }) => {
  const organiserCredentials = buildOrganiserCredentials("people-member-organiser");
  const memberCredentials = buildMemberCredentials("people-member");

  await bootstrapOrganiserSession(page, organiserCredentials);
  await page.goto("/circle/people");
  await page.getByTestId("people-add-person-link").click();
  await page.getByTestId("person-name-input").fill("Robert Hill");
  await page.getByTestId("person-context-input").fill(
    "Robert is a long-time neighbour.",
  );
  await page.getByTestId("person-save-button").click();
  await expect(page).toHaveURL(/\/circle\/people$/);

  await page.goto("/circle/settings/invite");
  await page.getByTestId("generate-invite-code-button").click();
  const inviteCode = await readInviteCode(page);

  const memberContext = await createTestContext(browser);
  const memberPage = await memberContext.newPage();

  await joinMemberViaInvite(memberPage, inviteCode, memberCredentials);
  await memberPage.goto("/circle/people");
  await expect(memberPage.getByTestId("people-list")).toContainText("Robert Hill");
  await memberPage.getByText("Robert Hill").click();
  await expect(memberPage.getByTestId("person-member-readonly-note")).toBeVisible();

  await memberPage.goto(`${memberPage.url()}/edit`);
  await expect(memberPage.getByTestId("people-edit-restricted")).toBeVisible();

  await memberPage.goto("/circle/add-person");
  await expect(memberPage.getByTestId("add-person-restricted")).toBeVisible();

  await memberContext.close();
});
