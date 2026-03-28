import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

const siteUrl = process.env.BETTER_AUTH_URL ?? process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL!;
const secret = process.env.BETTER_AUTH_SECRET!;

// ---------------------------------------------------------------------------
// Better Auth Component Client
// ---------------------------------------------------------------------------
// Provides adapter methods, route registration, and helper utilities
// for integrating Convex with Better Auth.
export const authComponent = createClient<DataModel>(components.betterAuth);

// ---------------------------------------------------------------------------
// Auth Factory
// ---------------------------------------------------------------------------
// Creates a Better Auth instance bound to the current Convex context.
// Email/password is enabled for caregiver login.
// Senior tablet auth is handled separately via the kioskDevices table.
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: siteUrl,
    secret,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    plugins: [
      // Required for Convex JWT compatibility
      convex({ authConfig }),
    ],
  });
};

// ---------------------------------------------------------------------------
// Helper Query: Get Current Authenticated User
// ---------------------------------------------------------------------------
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return authComponent.getAuthUser(ctx);
  },
});
