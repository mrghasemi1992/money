/*
 * Better Auth tables (core + username and admin plugins + database rate limiting), written by
 * hand to match what Better Auth 1.7 expects, with UUID ids (`generateId: "uuid"`) and
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
    ...timestamps(),
  },
  (table) => [check("user_role_check", oneOf(table.role, USER_ROLES))],
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
