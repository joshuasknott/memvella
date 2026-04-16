import "server-only";

import type { NextRequest } from "next/server";
import { createConvexHttpClient } from "@/lib/convex-http";
import {
  ensureMemvellaTestAuthTokenValid,
  ensureMemvellaTestModeEnabled,
  getMemvellaTestAuthToken,
  MEMVELLA_TEST_AUTH_TOKEN_HEADER,
} from "@/lib/test-mode";

export function ensureMemvellaTestRequest(request: NextRequest) {
  ensureMemvellaTestModeEnabled();
  ensureMemvellaTestAuthTokenValid(
    request.headers.get(MEMVELLA_TEST_AUTH_TOKEN_HEADER),
  );
}

export async function runMemvellaTestSupportQuery<TResult>(
  functionName: string,
  args: Record<string, unknown> = {},
) {
  const convex = createConvexHttpClient();
  return (await (convex.query as (...queryArgs: unknown[]) => Promise<unknown>)(
    functionName,
    {
      authToken: getMemvellaTestAuthToken(),
      ...args,
    },
  )) as TResult;
}

export async function runMemvellaTestSupportMutation<TResult>(
  functionName: string,
  args: Record<string, unknown> = {},
) {
  const convex = createConvexHttpClient();
  return (await (convex.mutation as (...mutationArgs: unknown[]) => Promise<unknown>)(
    functionName,
    {
      authToken: getMemvellaTestAuthToken(),
      ...args,
    },
  )) as TResult;
}
