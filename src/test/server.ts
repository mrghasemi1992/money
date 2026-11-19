import { createTranslator } from "next-intl";
import { vi } from "vitest";

import { combinePreferences } from "@/helpers/preferences";
import { MESSAGES } from "@/messages";
import type { Currency } from "@/types/currency";
import type { Locale } from "@/types/locale";
import type { UserRole } from "@/types/user";

/*
 * Stand-ins for what Server Actions, pages and Route Handlers call on the server, so the real
 * `requireUser`, `requireWrite` and `requireAdmin` (src/auth/session.ts) run in tests. A test
 * file mocks the modules it needs with this one:
 *
 *   vi.mock("@/auth", () => import("@/test/server"));
 *   vi.mock("next/headers", () => import("@/test/server"));
 *   vi.mock("next/navigation", () => import("@/test/server"));
 *   vi.mock("next/cache", () => import("@/test/server"));
 *   vi.mock("next-intl/server", () => import("@/test/server"));
 *   vi.mock("@/i18n/preferences", () => import("@/test/server"));
 *
 * then signs in with `signInAs("editor")`. `redirect` and `notFound` throw `NavigationError`,
 * as Next's do, so a test sees where a refused request went.
 */

export class NavigationError extends Error {
  constructor(
    readonly kind: "redirect" | "notFound",
    readonly to?: string,
  ) {
    super(kind === "redirect" ? `redirect to ${to}` : "not found");
  }
}

/**
 * How a server call ended: "allowed", "notFound", or "redirect <path>". Other errors are
 * thrown on.
 */
export async function outcome(call: () => Promise<unknown>): Promise<string> {
  try {
    await call();
    return "allowed";
  } catch (error) {
    if (error instanceof NavigationError) {
      return error.kind === "redirect" ? `redirect ${error.to}` : "notFound";
    }
    throw error;
  }
}

export const TEST_USER_ID = "00000000-0000-4000-8000-0000000000a1";

type TestSession = {
  user: {
    id: string;
    name: string;
    username: string;
    role: UserRole;
    banned: boolean;
    locale: Locale;
    calendar: string;
    rialUnit: string;
  };
  session: { id: string; userId: string };
};

let session: TestSession | null = null;
let locale: Locale = "fa";
let requestHeaders = new Headers();
let currency: Currency = "IRR";
let requestCookies = new Map<string, string>();

/** Signs in for the next calls, as a user with this role (and other fields if given). */
export function signInAs(
  role: UserRole,
  user: Partial<TestSession["user"]> = {},
): TestSession {
  session = {
    user: {
      id: TEST_USER_ID,
      name: "سارا",
      username: "sara",
      role,
      banned: false,
      locale,
      calendar: "jalali",
      rialUnit: "rial",
      ...user,
    },
    session: { id: "session-1", userId: user.id ?? TEST_USER_ID },
  };
  return session;
}

export function signOut() {
  session = null;
}

/** The interface language of the request (getLocale, getTranslations). */
export function setLocale(next: Locale) {
  locale = next;
}

/** Headers of the request, such as the path the proxy passes along. */
export function setRequestHeaders(init: HeadersInit) {
  requestHeaders = new Headers(init);
}

/** Cookies of the request. */
export function setRequestCookies(values: Record<string, string>) {
  requestCookies = new Map(Object.entries(values));
}

/** The book's currency (getPreferences). */
export function setCurrency(next: Currency) {
  currency = next;
}

/** Back to signed out, Persian, rials and no headers or cookies; call in `beforeEach`. */
export function resetServer() {
  session = null;
  locale = "fa";
  currency = "IRR";
  requestHeaders = new Headers();
  requestCookies = new Map();
}

// @/auth: the session lookup, and the Better Auth calls the actions make (each resolves to
// nothing until a test says otherwise).
export const auth = {
  api: {
    getSession: vi.fn(async () => session),
    updateUser: vi.fn(async () => ({})),
    changePassword: vi.fn(async () => ({})),
    createUser: vi.fn(async () => ({})),
    setUserPassword: vi.fn(async () => ({})),
    revokeUserSessions: vi.fn(async () => ({})),
    unbanUser: vi.fn(async () => ({})),
  },
};

// next/headers
export async function headers() {
  return requestHeaders;
}

export async function cookies() {
  return {
    get: (name: string) =>
      requestCookies.has(name)
        ? { name, value: requestCookies.get(name)! }
        : undefined,
    getAll: () => [...requestCookies].map(([name, value]) => ({ name, value })),
    has: (name: string) => requestCookies.has(name),
    set: vi.fn(),
    delete: vi.fn(),
  };
}

// next/navigation
export function redirect(to: string): never {
  throw new NavigationError("redirect", to);
}

export function notFound(): never {
  throw new NavigationError("notFound");
}

// next/cache
export const refresh = vi.fn();
export const revalidatePath = vi.fn();

// next-intl/server
export async function getLocale() {
  return locale;
}

export async function getTranslations(
  namespace?: string | { namespace?: string },
) {
  const name = typeof namespace === "string" ? namespace : namespace?.namespace;
  return createTranslator({
    locale,
    messages: MESSAGES[locale],
    // The real function takes any namespace of the messages.
    namespace: name as never,
  });
}

// @/i18n/preferences: the signed-in user's language and calendar, Tehran time.
export async function getPreferences() {
  return combinePreferences(
    {
      locale,
      calendar: locale === "fa" ? "jalali" : "gregorian",
      rialUnit: "rial",
    },
    { currency },
    "Asia/Tehran",
  );
}
