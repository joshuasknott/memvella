/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appEvents from "../appEvents.js";
import type * as auth from "../auth.js";
import type * as authEmail from "../authEmail.js";
import type * as authEnv from "../authEnv.js";
import type * as circleAuth from "../circleAuth.js";
import type * as circleInvites from "../circleInvites.js";
import type * as cleanup from "../cleanup.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as insights from "../insights.js";
import type * as insightsEngine from "../insightsEngine.js";
import type * as kiosk from "../kiosk.js";
import type * as liveVoice from "../liveVoice.js";
import type * as memories from "../memories.js";
import type * as memoryHelpers from "../memoryHelpers.js";
import type * as migrations from "../migrations.js";
import type * as notifications from "../notifications.js";
import type * as notificationsWorker from "../notificationsWorker.js";
import type * as organiser from "../organiser.js";
import type * as people from "../people.js";
import type * as profile from "../profile.js";
import type * as rateLimits from "../rateLimits.js";
import type * as routineCheckInScheduler from "../routineCheckInScheduler.js";
import type * as routineHelpers from "../routineHelpers.js";
import type * as routines from "../routines.js";
import type * as security from "../security.js";
import type * as seniorAccess from "../seniorAccess.js";
import type * as seniorAccessHelpers from "../seniorAccessHelpers.js";
import type * as sessions from "../sessions.js";
import type * as terminology from "../terminology.js";
import type * as testAwareness from "../testAwareness.js";
import type * as testSupport from "../testSupport.js";
import type * as uploadValidation from "../uploadValidation.js";
import type * as voiceHelpers from "../voiceHelpers.js";
import type * as voiceSafety from "../voiceSafety.js";
import type * as voiceShared from "../voiceShared.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appEvents: typeof appEvents;
  auth: typeof auth;
  authEmail: typeof authEmail;
  authEnv: typeof authEnv;
  circleAuth: typeof circleAuth;
  circleInvites: typeof circleInvites;
  cleanup: typeof cleanup;
  crons: typeof crons;
  http: typeof http;
  insights: typeof insights;
  insightsEngine: typeof insightsEngine;
  kiosk: typeof kiosk;
  liveVoice: typeof liveVoice;
  memories: typeof memories;
  memoryHelpers: typeof memoryHelpers;
  migrations: typeof migrations;
  notifications: typeof notifications;
  notificationsWorker: typeof notificationsWorker;
  organiser: typeof organiser;
  people: typeof people;
  profile: typeof profile;
  rateLimits: typeof rateLimits;
  routineCheckInScheduler: typeof routineCheckInScheduler;
  routineHelpers: typeof routineHelpers;
  routines: typeof routines;
  security: typeof security;
  seniorAccess: typeof seniorAccess;
  seniorAccessHelpers: typeof seniorAccessHelpers;
  sessions: typeof sessions;
  terminology: typeof terminology;
  testAwareness: typeof testAwareness;
  testSupport: typeof testSupport;
  uploadValidation: typeof uploadValidation;
  voiceHelpers: typeof voiceHelpers;
  voiceSafety: typeof voiceSafety;
  voiceShared: typeof voiceShared;
  waitlist: typeof waitlist;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {
  betterAuth: import("@convex-dev/better-auth/_generated/component.js").ComponentApi<"betterAuth">;
  migrations: import("@convex-dev/migrations/_generated/component.js").ComponentApi<"migrations">;
};
