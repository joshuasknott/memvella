import type { APIRequestContext, Browser, BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

export const PLAYWRIGHT_BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";
export const MEMVELLA_TEST_AUTH_TOKEN_HEADER = "x-memvella-test-auth-token";
export const MEMVELLA_TEST_AUTH_TOKEN =
  process.env.MEMVELLA_TEST_AUTH_TOKEN ?? "memvella-local-test-token";

export const ASSISTED_SESSION_STORAGE_KEY = "memvella_assisted_senior_session";
export const ASSISTED_DEVICE_BINDING_STORAGE_KEY =
  "memvella_assisted_device_binding";

type InitScriptTarget = BrowserContext | Page;
type SeniorExperience = "assisted";

type SeniorSessionBootstrapResult = {
  experience: SeniorExperience;
  circleId: string | null;
  deviceFingerprint: string;
  seniorName: string;
  seniorProfileId: string;
  sessionToken: string;
};

export function buildMemvellaTestHeaders() {
  return {
    [MEMVELLA_TEST_AUTH_TOKEN_HEADER]: MEMVELLA_TEST_AUTH_TOKEN,
  };
}

export function buildMemvellaTestApiHeaders() {
  return {
    ...buildMemvellaTestHeaders(),
    Origin: PLAYWRIGHT_BASE_URL,
  };
}

export async function installMemvellaTestMode(target: InitScriptTarget) {
  const testAuthToken = MEMVELLA_TEST_AUTH_TOKEN;

  await target.addInitScript(() => {
    window.__MEMVELLA_TEST_MODE__ = true;
    window.__memvellaTestSpeech = {
      instantSpeechSynthesis: true,
      ...(window.__memvellaTestSpeech ?? {}),
    };
    window.__memvellaTestLiveVoice = window.__memvellaTestLiveVoice ?? {};
  });
  await target.addInitScript((token) => {
    (window as Window & { __MEMVELLA_TEST_AUTH_TOKEN__?: string }).__MEMVELLA_TEST_AUTH_TOKEN__ =
      token;
  }, testAuthToken);
}

export async function createTestContext(browser: Browser) {
  const context = await browser.newContext({
    baseURL: PLAYWRIGHT_BASE_URL,
  });
  await installMemvellaTestMode(context);
  return context;
}

export async function resetApp(request: APIRequestContext) {
  const response = await request.post(`${PLAYWRIGHT_BASE_URL}/api/test/reset`, {
    headers: buildMemvellaTestApiHeaders(),
  });

  expect(response.ok()).toBeTruthy();
}

export async function seedAwarenessReviewFixture(
  request: APIRequestContext,
  args: { authEmail: string },
) {
  const response = await request.post(
    `${PLAYWRIGHT_BASE_URL}/api/test/bootstrap/awareness-review`,
    {
      headers: buildMemvellaTestApiHeaders(),
      data: args,
    },
  );

  expect(response.ok()).toBeTruthy();
  return (await response.json()) as {
    alertId: string;
    insightId: string;
  };
}

export async function waitForCircleReady(page: Page) {
  await page.waitForURL(/\/circle(?:$|\?)/, {
    timeout: 30_000,
  });
  await expect(page.getByTestId("circle-ready")).toHaveAttribute(
    "data-status",
    "ready",
    {
      timeout: 30_000,
    },
  );
}

export async function bootstrapSeniorSession(
  page: Page,
  args: {
    experience: SeniorExperience;
    seniorName?: string;
    circleName?: string;
  },
) {
  const response = await page.request.post(
    `${PLAYWRIGHT_BASE_URL}/api/test/bootstrap/senior-session`,
    {
      headers: buildMemvellaTestHeaders(),
      data: args,
    },
  );

  expect(response.ok()).toBeTruthy();
  const payload = (await response.json()) as SeniorSessionBootstrapResult;

  await page.addInitScript(
    ({
      experience,
      deviceFingerprint,
      seniorName,
      sessionToken,
    }: SeniorSessionBootstrapResult) => {
      const sessionState = {
        sessionToken,
        seniorName,
        deviceFingerprint,
      };

      localStorage.setItem(
        "memvella_assisted_senior_session",
        JSON.stringify(sessionState),
      );
      localStorage.setItem(
        "memvella_assisted_device_binding",
        deviceFingerprint,
      );
    },
    payload,
  );

  return payload;
}

export async function injectInvalidAssistedSession(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem(
      "memvella_assisted_senior_session",
      JSON.stringify({
        sessionToken: "memvella-invalid-assisted-session",
        seniorName: "Mabel",
        deviceFingerprint: "memvella-invalid-assisted-device",
      }),
    );
    localStorage.setItem(
      "memvella_assisted_device_binding",
      "memvella-invalid-assisted-device",
    );
  });
}
