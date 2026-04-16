/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agent from "../agent.js";
import type * as aiActions from "../aiActions.js";
import type * as auth from "../auth.js";
import type * as circleAuth from "../circleAuth.js";
import type * as circleInvites from "../circleInvites.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as independentAccess from "../independentAccess.js";
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
import type * as testSupport from "../testSupport.js";
import type * as uploadValidation from "../uploadValidation.js";
import type * as voice from "../voice.js";
import type * as voiceHelpers from "../voiceHelpers.js";
import type * as voiceSafety from "../voiceSafety.js";
import type * as voiceSession from "../voiceSession.js";
import type * as waitlist from "../waitlist.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agent: typeof agent;
  aiActions: typeof aiActions;
  auth: typeof auth;
  circleAuth: typeof circleAuth;
  circleInvites: typeof circleInvites;
  crons: typeof crons;
  http: typeof http;
  independentAccess: typeof independentAccess;
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
  testSupport: typeof testSupport;
  uploadValidation: typeof uploadValidation;
  voice: typeof voice;
  voiceHelpers: typeof voiceHelpers;
  voiceSafety: typeof voiceSafety;
  voiceSession: typeof voiceSession;
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
  betterAuth: {
    adapter: {
      create: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                data: {
                  createdAt: number;
                  displayUsername?: null | string;
                  email: string;
                  emailVerified: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt: number;
                  userId?: null | string;
                  username?: null | string;
                };
                model: "user";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  ipAddress?: null | string;
                  token: string;
                  updatedAt: number;
                  userAgent?: null | string;
                  userId: string;
                };
                model: "session";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId: string;
                  createdAt: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt: number;
                  userId: string;
                };
                model: "account";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt: number;
                  identifier: string;
                  updatedAt: number;
                  value: string;
                };
                model: "verification";
              }
            | {
                data: { backupCodes: string; secret: string; userId: string };
                model: "twoFactor";
              }
            | {
                data: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectUrls?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthApplication";
              }
            | {
                data: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthAccessToken";
              }
            | {
                data: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                model: "oauthConsent";
              }
            | {
                data: {
                  createdAt: number;
                  expiresAt?: null | number;
                  privateKey: string;
                  publicKey: string;
                };
                model: "jwks";
              }
            | {
                data: { count: number; key: string; lastRequest: number };
                model: "rateLimit";
              };
          onCreateHandle?: string;
          select?: Array<string>;
        },
        any
      >;
      deleteMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      deleteOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onDeleteHandle?: string;
        },
        any
      >;
      findMany: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          limit?: number;
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit";
          offset?: number;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
          select?: Array<string>;
          sortBy?: { direction: "asc" | "desc"; field: string };
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      findOne: FunctionReference<
        "query",
        "internal",
        {
          join?: any;
          model:
            | "user"
            | "session"
            | "account"
            | "verification"
            | "twoFactor"
            | "oauthApplication"
            | "oauthAccessToken"
            | "oauthConsent"
            | "jwks"
            | "rateLimit";
          select?: Array<string>;
          where?: Array<{
            connector?: "AND" | "OR";
            field: string;
            operator?:
              | "lt"
              | "lte"
              | "gt"
              | "gte"
              | "eq"
              | "in"
              | "not_in"
              | "ne"
              | "contains"
              | "starts_with"
              | "ends_with";
            value:
              | string
              | number
              | boolean
              | Array<string>
              | Array<number>
              | null;
          }>;
        },
        any
      >;
      updateMany: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectUrls?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  expiresAt?: null | number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: { count?: number; key?: string; lastRequest?: number };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
          paginationOpts: {
            cursor: string | null;
            endCursor?: string | null;
            id?: number;
            maximumBytesRead?: number;
            maximumRowsRead?: number;
            numItems: number;
          };
        },
        any
      >;
      updateOne: FunctionReference<
        "mutation",
        "internal",
        {
          input:
            | {
                model: "user";
                update: {
                  createdAt?: number;
                  displayUsername?: null | string;
                  email?: string;
                  emailVerified?: boolean;
                  image?: null | string;
                  isAnonymous?: null | boolean;
                  name?: string;
                  phoneNumber?: null | string;
                  phoneNumberVerified?: null | boolean;
                  twoFactorEnabled?: null | boolean;
                  updatedAt?: number;
                  userId?: null | string;
                  username?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "email"
                    | "emailVerified"
                    | "image"
                    | "createdAt"
                    | "updatedAt"
                    | "twoFactorEnabled"
                    | "isAnonymous"
                    | "username"
                    | "displayUsername"
                    | "phoneNumber"
                    | "phoneNumberVerified"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "session";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  ipAddress?: null | string;
                  token?: string;
                  updatedAt?: number;
                  userAgent?: null | string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "expiresAt"
                    | "token"
                    | "createdAt"
                    | "updatedAt"
                    | "ipAddress"
                    | "userAgent"
                    | "userId"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "account";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  accountId?: string;
                  createdAt?: number;
                  idToken?: null | string;
                  password?: null | string;
                  providerId?: string;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scope?: null | string;
                  updatedAt?: number;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accountId"
                    | "providerId"
                    | "userId"
                    | "accessToken"
                    | "refreshToken"
                    | "idToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "scope"
                    | "password"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "verification";
                update: {
                  createdAt?: number;
                  expiresAt?: number;
                  identifier?: string;
                  updatedAt?: number;
                  value?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "identifier"
                    | "value"
                    | "expiresAt"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "twoFactor";
                update: {
                  backupCodes?: string;
                  secret?: string;
                  userId?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "secret" | "backupCodes" | "userId" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthApplication";
                update: {
                  clientId?: null | string;
                  clientSecret?: null | string;
                  createdAt?: null | number;
                  disabled?: null | boolean;
                  icon?: null | string;
                  metadata?: null | string;
                  name?: null | string;
                  redirectUrls?: null | string;
                  type?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "name"
                    | "icon"
                    | "metadata"
                    | "clientId"
                    | "clientSecret"
                    | "redirectUrls"
                    | "type"
                    | "disabled"
                    | "userId"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthAccessToken";
                update: {
                  accessToken?: null | string;
                  accessTokenExpiresAt?: null | number;
                  clientId?: null | string;
                  createdAt?: null | number;
                  refreshToken?: null | string;
                  refreshTokenExpiresAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "accessToken"
                    | "refreshToken"
                    | "accessTokenExpiresAt"
                    | "refreshTokenExpiresAt"
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "oauthConsent";
                update: {
                  clientId?: null | string;
                  consentGiven?: null | boolean;
                  createdAt?: null | number;
                  scopes?: null | string;
                  updatedAt?: null | number;
                  userId?: null | string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "clientId"
                    | "userId"
                    | "scopes"
                    | "createdAt"
                    | "updatedAt"
                    | "consentGiven"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "jwks";
                update: {
                  createdAt?: number;
                  expiresAt?: null | number;
                  privateKey?: string;
                  publicKey?: string;
                };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field:
                    | "publicKey"
                    | "privateKey"
                    | "createdAt"
                    | "expiresAt"
                    | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              }
            | {
                model: "rateLimit";
                update: { count?: number; key?: string; lastRequest?: number };
                where?: Array<{
                  connector?: "AND" | "OR";
                  field: "key" | "count" | "lastRequest" | "_id";
                  operator?:
                    | "lt"
                    | "lte"
                    | "gt"
                    | "gte"
                    | "eq"
                    | "in"
                    | "not_in"
                    | "ne"
                    | "contains"
                    | "starts_with"
                    | "ends_with";
                  value:
                    | string
                    | number
                    | boolean
                    | Array<string>
                    | Array<number>
                    | null;
                }>;
              };
          onUpdateHandle?: string;
        },
        any
      >;
    };
    adapterTest: {
      runTests: FunctionReference<"action", "internal", any, any>;
    };
    testProfiles: {
      adapterAdditionalFields: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email: string;
                    emailVerified: boolean;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: string;
                    emailVerified?: boolean;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: string;
                    emailVerified?: boolean;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "customField"
                      | "numericField"
                      | "testField"
                      | "cbDefaultValueField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterOrganizationJoins: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterPluginTable: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterRenameField: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterRenameUserCustom: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
      adapterRenameUserTable: {
        create: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    ipAddress?: null | string;
                    token: string;
                    updatedAt: number;
                    userAgent?: null | string;
                    userId: string;
                  };
                  model: "session";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId: string;
                    createdAt: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt: number;
                    userId: string;
                  };
                  model: "account";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt: number;
                    identifier: string;
                    updatedAt: number;
                    value: string;
                  };
                  model: "verification";
                }
              | {
                  data: { backupCodes: string; secret: string; userId: string };
                  model: "twoFactor";
                }
              | {
                  data: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthApplication";
                }
              | {
                  data: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthAccessToken";
                }
              | {
                  data: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  model: "oauthConsent";
                }
              | {
                  data: {
                    createdAt: number;
                    expiresAt?: null | number;
                    privateKey: string;
                    publicKey: string;
                  };
                  model: "jwks";
                }
              | {
                  data: { count: number; key: string; lastRequest: number };
                  model: "rateLimit";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_custom";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    createdAt: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  model: "user_table";
                }
              | { data: { oneToOne: string }; model: "oneToOneTable" }
              | {
                  data: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  model: "one_to_one_table";
                }
              | {
                  data: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  model: "testModel";
                }
              | {
                  data: {
                    createdAt: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name: string;
                    slug: string;
                    updatedAt?: null | number;
                  };
                  model: "organization";
                }
              | {
                  data: {
                    createdAt: number;
                    organizationId: string;
                    role: string;
                    updatedAt?: null | number;
                    userId: string;
                  };
                  model: "member";
                }
              | {
                  data: {
                    createdAt: number;
                    name: string;
                    organizationId: string;
                    updatedAt?: null | number;
                  };
                  model: "team";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    teamId: string;
                    userId: string;
                  };
                  model: "teamMember";
                }
              | {
                  data: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  model: "invitation";
                };
            onCreateHandle?: string;
            select?: Array<string>;
          },
          any
        >;
        deleteMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        deleteOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onDeleteHandle?: string;
          },
          any
        >;
        findMany: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            limit?: number;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            offset?: number;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
            select?: Array<string>;
            sortBy?: { direction: "asc" | "desc"; field: string };
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        findOne: FunctionReference<
          "query",
          "internal",
          {
            join?: any;
            model:
              | "user"
              | "session"
              | "account"
              | "verification"
              | "twoFactor"
              | "oauthApplication"
              | "oauthAccessToken"
              | "oauthConsent"
              | "jwks"
              | "rateLimit"
              | "user_custom"
              | "user_table"
              | "oneToOneTable"
              | "one_to_one_table"
              | "testModel"
              | "organization"
              | "member"
              | "team"
              | "teamMember"
              | "invitation";
            select?: Array<string>;
            where?: Array<{
              connector?: "AND" | "OR";
              field: string;
              operator?:
                | "lt"
                | "lte"
                | "gt"
                | "gte"
                | "eq"
                | "in"
                | "not_in"
                | "ne"
                | "contains"
                | "starts_with"
                | "ends_with";
              value:
                | string
                | number
                | boolean
                | Array<string>
                | Array<number>
                | null;
            }>;
          },
          any
        >;
        updateMany: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
            paginationOpts: {
              cursor: string | null;
              endCursor?: string | null;
              id?: number;
              maximumBytesRead?: number;
              maximumRowsRead?: number;
              numItems: number;
            };
          },
          any
        >;
        updateOne: FunctionReference<
          "mutation",
          "internal",
          {
            input:
              | {
                  model: "user";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "session";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    ipAddress?: null | string;
                    token?: string;
                    updatedAt?: number;
                    userAgent?: null | string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "expiresAt"
                      | "token"
                      | "createdAt"
                      | "updatedAt"
                      | "ipAddress"
                      | "userAgent"
                      | "userId"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "account";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    accountId?: string;
                    createdAt?: number;
                    idToken?: null | string;
                    password?: null | string;
                    providerId?: string;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scope?: null | string;
                    updatedAt?: number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accountId"
                      | "providerId"
                      | "userId"
                      | "accessToken"
                      | "refreshToken"
                      | "idToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "scope"
                      | "password"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "verification";
                  update: {
                    createdAt?: number;
                    expiresAt?: number;
                    identifier?: string;
                    updatedAt?: number;
                    value?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "identifier"
                      | "value"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "twoFactor";
                  update: {
                    backupCodes?: string;
                    secret?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "secret" | "backupCodes" | "userId" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthApplication";
                  update: {
                    clientId?: null | string;
                    clientSecret?: null | string;
                    createdAt?: null | number;
                    disabled?: null | boolean;
                    icon?: null | string;
                    metadata?: null | string;
                    name?: null | string;
                    redirectUrls?: null | string;
                    type?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "icon"
                      | "metadata"
                      | "clientId"
                      | "clientSecret"
                      | "redirectUrls"
                      | "type"
                      | "disabled"
                      | "userId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthAccessToken";
                  update: {
                    accessToken?: null | string;
                    accessTokenExpiresAt?: null | number;
                    clientId?: null | string;
                    createdAt?: null | number;
                    refreshToken?: null | string;
                    refreshTokenExpiresAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "accessToken"
                      | "refreshToken"
                      | "accessTokenExpiresAt"
                      | "refreshTokenExpiresAt"
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oauthConsent";
                  update: {
                    clientId?: null | string;
                    consentGiven?: null | boolean;
                    createdAt?: null | number;
                    scopes?: null | string;
                    updatedAt?: null | number;
                    userId?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "clientId"
                      | "userId"
                      | "scopes"
                      | "createdAt"
                      | "updatedAt"
                      | "consentGiven"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "jwks";
                  update: {
                    createdAt?: number;
                    expiresAt?: null | number;
                    privateKey?: string;
                    publicKey?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "publicKey"
                      | "privateKey"
                      | "createdAt"
                      | "expiresAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "rateLimit";
                  update: {
                    count?: number;
                    key?: string;
                    lastRequest?: number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "key" | "count" | "lastRequest" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_custom";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "user_table";
                  update: {
                    cbDefaultValueField?: null | string;
                    createdAt?: number;
                    customField?: null | string;
                    dateField?: null | number;
                    displayUsername?: null | string;
                    email?: null | string;
                    emailVerified?: boolean;
                    email_address?: null | string;
                    image?: null | string;
                    isAnonymous?: null | boolean;
                    name?: string;
                    numericField?: null | number;
                    phoneNumber?: null | string;
                    phoneNumberVerified?: null | boolean;
                    testField?: null | string;
                    twoFactorEnabled?: null | boolean;
                    updatedAt?: number;
                    userId?: null | string;
                    username?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "email"
                      | "email_address"
                      | "emailVerified"
                      | "image"
                      | "createdAt"
                      | "updatedAt"
                      | "twoFactorEnabled"
                      | "isAnonymous"
                      | "username"
                      | "displayUsername"
                      | "phoneNumber"
                      | "phoneNumberVerified"
                      | "userId"
                      | "testField"
                      | "cbDefaultValueField"
                      | "customField"
                      | "numericField"
                      | "dateField"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "oneToOneTable";
                  update: { oneToOne?: string };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "one_to_one_table";
                  update: {
                    oneToOne?: null | string;
                    one_to_one?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "oneToOne" | "one_to_one" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "testModel";
                  update: {
                    cbDefaultValueField?: null | string;
                    json?: any;
                    nullableReference?: null | string;
                    numberArray?: null | Array<number>;
                    stringArray?: null | Array<string>;
                    testField?: null | string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "nullableReference"
                      | "testField"
                      | "cbDefaultValueField"
                      | "stringArray"
                      | "numberArray"
                      | "json"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "organization";
                  update: {
                    createdAt?: number;
                    logo?: null | string;
                    metadata?: null | string;
                    name?: string;
                    slug?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "slug"
                      | "logo"
                      | "metadata"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "member";
                  update: {
                    createdAt?: number;
                    organizationId?: string;
                    role?: string;
                    updatedAt?: null | number;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "organizationId"
                      | "userId"
                      | "role"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "team";
                  update: {
                    createdAt?: number;
                    name?: string;
                    organizationId?: string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "name"
                      | "organizationId"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "teamMember";
                  update: {
                    createdAt?: null | number;
                    teamId?: string;
                    userId?: string;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field: "teamId" | "userId" | "createdAt" | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                }
              | {
                  model: "invitation";
                  update: {
                    createdAt?: null | number;
                    email?: null | string;
                    expiresAt?: null | number;
                    inviterId?: null | string;
                    organizationId?: null | string;
                    role?: null | string;
                    status?: null | string;
                    teamId?: null | string;
                    updatedAt?: null | number;
                  };
                  where?: Array<{
                    connector?: "AND" | "OR";
                    field:
                      | "email"
                      | "role"
                      | "status"
                      | "organizationId"
                      | "teamId"
                      | "inviterId"
                      | "expiresAt"
                      | "createdAt"
                      | "updatedAt"
                      | "_id";
                    operator?:
                      | "lt"
                      | "lte"
                      | "gt"
                      | "gte"
                      | "eq"
                      | "in"
                      | "not_in"
                      | "ne"
                      | "contains"
                      | "starts_with"
                      | "ends_with";
                    value:
                      | string
                      | number
                      | boolean
                      | Array<string>
                      | Array<number>
                      | null;
                  }>;
                };
            onUpdateHandle?: string;
          },
          any
        >;
      };
    };
  };
  migrations: {
    lib: {
      cancel: FunctionReference<
        "mutation",
        "internal",
        { name: string },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
      cancelAll: FunctionReference<
        "mutation",
        "internal",
        { sinceTs?: number },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getStatus: FunctionReference<
        "query",
        "internal",
        { limit?: number; names?: Array<string> },
        Array<{
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }>
      >;
      migrate: FunctionReference<
        "mutation",
        "internal",
        {
          batchSize?: number;
          cursor?: string | null;
          dryRun: boolean;
          fnHandle: string;
          name: string;
          next?: Array<{ fnHandle: string; name: string }>;
          oneBatchOnly?: boolean;
          reset?: boolean;
        },
        {
          batchSize?: number;
          cursor?: string | null;
          error?: string;
          isDone: boolean;
          latestEnd?: number;
          latestStart: number;
          name: string;
          next?: Array<string>;
          processed: number;
          state: "inProgress" | "success" | "failed" | "canceled" | "unknown";
        }
      >;
    };
  };
};
