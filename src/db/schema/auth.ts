/*
 * Better Auth tables (core + username and admin plugins + database rate limiting), written by
 * hand to match what Better Auth 1.7 expects, with UUID ids (made by `generateId`) and
 * timestamptz columns. Field names are the ones Better Auth uses; `casing: "snake_case"` turns
 * them into snake_case columns. When a Better Auth upgrade or a new plugin adds fields, add
 * them here and run `pnpm db:generate`.
 */

import {
  bigint,
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { CALENDARS, DEFAULT_CALENDAR } from "@/constants/calendar";
import { DEFAULT_RIAL_UNIT, RIAL_UNITS } from "@/constants/currency";
import { DEFAULT_LOCALE, LOCALES } from "@/constants/locale";
import { DEFAULT_USER_ROLE, USER_ROLES } from "@/constants/user";

import { id, oneOf, timestamps } from "./columns";

export const user = pgTable(
  "user",
  {
    id: id(),
    /** Display name. */
    name: text().notNull(),
    /**
     * Required and unique in Better Auth, but Money signs in by username and never shows it.
     * Users get a placeholder address (see `placeholderEmail`).
     */
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    image: text(),
    /** Lowercase; what users sign in with. */
    username: text().unique(),
    /** The username as it was typed. */
    displayUsername: text(),
    role: text({ enum: USER_ROLES }).notNull().default(DEFAULT_USER_ROLE),
    banned: boolean().notNull().default(false),
    banReason: text(),
    banExpires: timestamp({ withTimezone: true }),
    /** Interface language. Money's own field (Better Auth `additionalFields`), like the two below. */
    locale: text({ enum: LOCALES }).notNull().default(DEFAULT_LOCALE),
    /** Calendar dates are shown and picked in. */
    calendar: text({ enum: CALENDARS })
      .notNull()
      .default(DEFAULT_CALENDAR[DEFAULT_LOCALE]),
    /** Rial or toman, when the book's currency is IRR. */
    rialUnit: text({ enum: RIAL_UNITS }).notNull().default(DEFAULT_RIAL_UNIT),
    /**
     * IANA time zone the user's browser last reported. The Claude connector has no browser,
     * so its «today» is the user's today in this zone (Asia/Tehran until the web app reports one).
     */
    timeZone: text(),
    ...timestamps(),
  },
  (table) => [
    check("user_role_check", oneOf(table.role, USER_ROLES)),
    check("user_locale_check", oneOf(table.locale, LOCALES)),
    check("user_calendar_check", oneOf(table.calendar, CALENDARS)),
    check("user_rial_unit_check", oneOf(table.rialUnit, RIAL_UNITS)),
  ],
);

export const session = pgTable(
  "session",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text().notNull().unique(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ipAddress: text(),
    userAgent: text(),
    /** Set while an admin impersonates a user (admin plugin). */
    impersonatedBy: uuid(),
    ...timestamps(),
  },
  (table) => [index().on(table.userId)],
);

/**
 * Sign-in methods of a user. For Money that is one "credential" row holding the password hash.
 * Not to be confused with `accounts` (bank cards, cash).
 */
export const authAccount = pgTable(
  "account",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text().notNull(),
    providerId: text().notNull(),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    ...timestamps(),
  },
  (table) => [index().on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: id(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps(),
  },
  (table) => [index().on(table.identifier)],
);

/** Request counts per IP and path, so the sign-in limit holds across serverless instances. */
export const rateLimit = pgTable("rate_limit", {
  id: id(),
  key: text().notNull().unique(),
  count: integer().notNull(),
  /** Milliseconds since the epoch. */
  lastRequest: bigint({ mode: "number" }).notNull(),
});
