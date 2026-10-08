import "server-only";

import { cimd } from "@better-auth/cimd";
import { fetchClientMetadataResource } from "@better-auth/cimd/node";
import { mcp } from "@better-auth/mcp";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, jwt, username } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

import { LOGIN_PATH, SIGN_IN_LIMIT } from "@/constants/auth";
import { DEFAULT_CALENDAR } from "@/constants/calendar";
import { OAUTH_CONSENT_PATH, OAUTH_SCOPES } from "@/constants/connector";
import { DEFAULT_RIAL_UNIT } from "@/constants/currency";
import { DEFAULT_LOCALE } from "@/constants/locale";
import {
  DEFAULT_USER_ROLE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
} from "@/constants/user";
import { db } from "@/db";
import {
  authAccount,
  jwks,
  oauthAccessToken,
  oauthClient,
  oauthClientAssertion,
  oauthClientResource,
  oauthConsent,
  oauthRefreshToken,
  oauthResource,
  rateLimit,
  session,
  user,
  verification,
} from "@/db/schema";

import { getMcpResourceUrl } from "./urls";

/**
 * The app's URL. Production and local development set BETTER_AUTH_URL. Preview deployments
 * have no fixed URL, so they accept their own Vercel hosts (deployment and branch URL), which
 * Vercel sets for every deployment.
 */
function getBaseURL() {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  const vercelHosts = [
    process.env.VERCEL_URL,
    process.env.VERCEL_BRANCH_URL,
  ].filter((host): host is string => Boolean(host));
  if (vercelHosts.length === 0) return undefined;
  return { allowedHosts: vercelHosts, protocol: "https" as const };
}

/**
 * Better Auth: sign-in by username and password, invite only.
 * - Nobody can sign up. Users are created by an admin on /admin/users (admin plugin) or by
 *   `pnpm user:create`.
 * - Banned users can't sign in (admin plugin; checked after the password).
 * - Roles admin, editor and viewer. Only admins may use the admin plugin's user management;
 *   editors and viewers have no admin permissions. Reading and writing the book is checked by
 *   Money itself (`src/auth/session.ts`, `src/helpers/role.ts`), not by Better Auth.
 * - Each user's display preferences (language, calendar, rial or toman) are extra user fields,
 *   so they come with the session. Users change them through Money's own Server Actions, not
 *   Better Auth's update-user endpoint (`input: false`).
 * - Sign-in is limited per IP, counted in the database so the limit holds across serverless
 *   instances. Rate limits apply to HTTP requests to /api/auth only, so the login form posts
 *   there instead of calling auth.api from a Server Action.
 * - The Claude connector: an OAuth 2.1 authorization server for the MCP endpoint (`mcp`
 *   plugin). Claude identifies itself with a Client ID Metadata Document (`cimd`), there is no
 *   open client registration. Signing in goes through /login, then the consent page. Access
 *   tokens are JWTs bound to the MCP endpoint's URL, signed with the `jwt` plugin's key; the
 *   MCP route also checks the grant and the user in the database on every request
 *   (src/mcp/auth.ts), so revoking or disabling takes effect at once.
 */
export const auth = betterAuth({
  appName: "پول",
  baseURL: getBaseURL(),
  // Read from BETTER_AUTH_SECRET.
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account: authAccount,
      verification,
      rateLimit,
      jwks,
      oauthClient,
      oauthResource,
      oauthClientResource,
      oauthRefreshToken,
      oauthAccessToken,
      oauthConsent,
      oauthClientAssertion,
    },
  }),
  user: {
    additionalFields: {
      locale: { type: "string", defaultValue: DEFAULT_LOCALE, input: false },
      calendar: {
        type: "string",
        defaultValue: DEFAULT_CALENDAR[DEFAULT_LOCALE],
        input: false,
      },
      rialUnit: {
        type: "string",
        defaultValue: DEFAULT_RIAL_UNIT,
        input: false,
      },
      timeZone: { type: "string", required: false, input: false },
    },
  },
  emailAndPassword: {
    // Needed for passwords, but only the username plugin's sign-in is reachable (see disabledPaths).
    enabled: true,
    disableSignUp: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
  },
  // Endpoints Money doesn't offer: public sign-up, sign-in by email (users have no real email),
  // the username availability check (it would reveal which usernames exist) and the JWT
  // plugin's session-to-JWT endpoint (its keys only sign OAuth access tokens).
  disabledPaths: [
    "/sign-up/email",
    "/sign-in/email",
    "/is-username-available",
    "/token",
  ],
  rateLimit: {
    enabled: true,
    storage: "database",
    customRules: {
      "/sign-in/username": {
        window: SIGN_IN_LIMIT.windowSeconds,
        max: SIGN_IN_LIMIT.maxAttempts,
      },
    },
  },
  advanced: {
    database: { generateId: "uuid" },
    // Vercel overwrites this header with the client's IP, so it can't be spoofed.
    ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
  },
  plugins: [
    username({
      minUsernameLength: USERNAME_MIN_LENGTH,
      maxUsernameLength: USERNAME_MAX_LENGTH,
      usernameValidator: (value) => USERNAME_PATTERN.test(value),
    }),
    admin({
      roles: { admin: adminAc, editor: userAc, viewer: userAc },
      defaultRole: DEFAULT_USER_ROLE,
      adminRoles: ["admin"],
    }),
    jwt({ disableSettingJwtHeader: true }),
    mcp({
      resource: getMcpResourceUrl(),
      loginPage: LOGIN_PATH,
      consentPage: OAUTH_CONSENT_PATH,
      scopes: [...OAUTH_SCOPES],
      // Users sign in; no machine-to-machine tokens.
      grantTypes: ["authorization_code", "refresh_token"],
      // Nobody creates, edits or lists OAuth clients through the API (by default any signed-in
      // user could). Clients come from Client ID Metadata Documents only.
      clientPrivileges: () => false,
    }),
    cimd({
      fetchClientMetadataResource,
      metadataProfile: "mcp-2026-07-28",
    }),
    // Must be last: sets cookies when auth.api is called from Server Actions (sign-out).
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
