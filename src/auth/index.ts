import "server-only";

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, username } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";

import { SIGN_IN_LIMIT } from "@/constants/auth";
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
  rateLimit,
  session,
  user,
  verification,
} from "@/db/schema";

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
 * - Nobody can sign up. Users are created by an admin (admin plugin, Phase 3) or by
 *   `pnpm user:create`.
 * - Banned users can't sign in (admin plugin; checked after the password).
 * - Roles admin, editor and viewer. Only admins may use the admin plugin's user management;
 *   editors and viewers have no admin permissions. Reading and writing the book is checked by
 *   Money itself (`src/auth/session.ts`, `src/helpers/role.ts`), not by Better Auth.
 * - Sign-in is limited per IP, counted in the database so the limit holds across serverless
 *   instances. Rate limits apply to HTTP requests to /api/auth only, so the login form posts
 *   there instead of calling auth.api from a Server Action.
 */
export const auth = betterAuth({
  appName: "پول",
  baseURL: getBaseURL(),
  // Read from BETTER_AUTH_SECRET.
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account: authAccount, verification, rateLimit },
  }),
  emailAndPassword: {
    // Needed for passwords, but only the username plugin's sign-in is reachable (see disabledPaths).
    enabled: true,
    disableSignUp: true,
    minPasswordLength: PASSWORD_MIN_LENGTH,
    maxPasswordLength: PASSWORD_MAX_LENGTH,
  },
  // Endpoints Money doesn't offer: public sign-up, sign-in by email (users have no real email)
  // and the username availability check (it would reveal which usernames exist).
  disabledPaths: ["/sign-up/email", "/sign-in/email", "/is-username-available"],
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
    // Must be last: sets cookies when auth.api is called from Server Actions (sign-out).
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
