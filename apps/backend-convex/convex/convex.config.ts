import { defineApp } from "convex/server";
import { v } from "convex/values";
import betterAuth from "@convex-dev/better-auth/convex.config";
import migrations from "@convex-dev/migrations/convex.config";

const app = defineApp({
  env: {
    BETTER_AUTH_URL: v.optional(v.string()),
    BETTER_AUTH_TRUSTED_ORIGINS: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
    NEXT_PUBLIC_SITE_URL: v.optional(v.string()),
    BETTER_AUTH_SECRET: v.optional(v.string()),
    MEMVELLA_AUTH_PEPPER: v.optional(v.string()),
    RESEND_API_KEY: v.optional(v.string()),
    MEMVELLA_AUTH_EMAIL_FROM: v.optional(v.string()),
    MEMVELLA_TEST_MODE: v.optional(v.string()),
    MEMVELLA_TEST_AUTH_TOKEN: v.optional(v.string()),
    GEMINI_API_KEY: v.optional(v.string()),
    NEXT_PUBLIC_MEMVELLA_WEB_PUSH_PUBLIC_KEY: v.optional(v.string()),
    MEMVELLA_WEB_PUSH_PRIVATE_KEY: v.optional(v.string()),
    MEMVELLA_WEB_PUSH_SUBJECT: v.optional(v.string()),
    CONVEX_DEPLOYMENT: v.optional(v.string()),
    NODE_ENV: v.optional(v.string()),
  },
});
app.use(betterAuth);
app.use(migrations);

export default app;
