import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import {
  buildMemvellaTestHeaders,
  PLAYWRIGHT_BASE_URL,
  waitForCircleReady,
} from "./test-support";

type FamilyAccountCredentials = {
  email: string;
  name: string;
  password: string;
};

export type OrganiserCredentials = FamilyAccountCredentials & {
  seniorName: string;
};

export type MemberCredentials = FamilyAccountCredentials;

function buildUniqueSuffix(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10_000)}`;
}

export function buildOrganiserCredentials(prefix: string): OrganiserCredentials {
  const suffix = buildUniqueSuffix(prefix);
  return {
    email: `${suffix}@memvella.test`,
    name: "Sarah Organiser",
    password: "memvella-password-123",
    seniorName: "David",
  };
}

export function buildMemberCredentials(prefix: string): MemberCredentials {
  const suffix = buildUniqueSuffix(prefix);
  return {
    email: `${suffix}@memvella.test`,
    name: "Emma Member",
    password: "memvella-password-123",
  };
}

export async function signOutFamilyAccount(page: Page) {
  await page.context().clearCookies();
}

export async function bootstrapOrganiserSession(
  page: Page,
  credentials: OrganiserCredentials,
) {
  await page.goto("/");
  await page.locator("#btn-for-loved-one").click();
  await page.locator("#btn-start-circle").click();
  await page.getByTestId("organiser-name-input").fill(credentials.name);
  await page.getByTestId("organiser-senior-name-input").fill(
    credentials.seniorName,
  );
  await page.getByTestId("organiser-email-input").fill(credentials.email);
  await page.getByTestId("organiser-password-input").fill(
    credentials.password,
  );
  await page.getByTestId("organiser-submit-button").click();
  await waitForCircleReady(page);
  await expect(page).toHaveURL(/\/circle$/);
}

export async function readInviteCode(page: Page) {
  const inviteCode = await page.getByTestId("active-invite-code").textContent();
  return inviteCode?.trim() ?? "";
}

export async function joinMemberViaInvite(
  page: Page,
  inviteCode: string,
  credentials: MemberCredentials,
) {
  await page.goto("/");
  const result = await page.evaluate(
    async ({ inviteCode: nextInviteCode, nextCredentials, testAuthToken }) => {
      const headers = {
        "Content-Type": "application/json",
        "x-memvella-test-auth-token": testAuthToken,
      };

      const signUpResponse = await fetch("/api/test/auth", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          mode: "sign-up",
          email: nextCredentials.email,
          name: nextCredentials.name,
          password: nextCredentials.password,
        }),
      });
      const signUpBody = await signUpResponse.text();
      if (!signUpResponse.ok) {
        throw new Error(signUpBody || "Member sign-up failed.");
      }

      const redeemResponse = await fetch(
        "/api/test/bootstrap/member-invite/redeem",
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            inviteCode: nextInviteCode,
          }),
        },
      );
      const redeemBody = await redeemResponse.text();
      if (!redeemResponse.ok) {
        throw new Error(redeemBody || "Member invite redeem failed.");
      }

      return {
        redeemBody,
        signUpBody,
      };
    },
    {
      inviteCode,
      nextCredentials: credentials,
      testAuthToken: buildMemvellaTestHeaders()["x-memvella-test-auth-token"],
    },
  );
  expect(result).toBeTruthy();

  await page.goto("/circle");
  await waitForCircleReady(page);
  await expect(page).toHaveURL(/\/circle$/);
}
