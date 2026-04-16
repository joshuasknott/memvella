import { test as base, expect } from "@playwright/test";
import {
  installMemvellaTestMode,
  resetApp,
} from "../helpers/test-support";

export const test = base.extend({
  context: async ({ context }, use) => {
    await installMemvellaTestMode(context);
    await use(context);
  },
});

test.beforeEach(async ({ request }) => {
  await resetApp(request);
});

export { expect };
