/*
 * Tables of Better Auth's JWT plugin and OAuth 2.1 provider (the `mcp` plugin, with Client ID
 * Metadata Documents), written by hand like the other Better Auth tables in auth.ts: field
 * names as Better Auth uses them, UUID ids, timestamptz. They back the Claude connector:
 * - `jwks`: the key pair access tokens are signed with (private key encrypted with the secret).
 * - `oauthClient`: apps that may ask for access. Claude identifies itself with a Client ID
 *   Metadata Document: its `clientId` is the URL of that document.
 * - `oauthConsent`: one row per user and app the user allowed; Money's "connected apps".
 * - `oauthRefreshToken` / `oauthAccessToken`: tokens issued to an app for a user (stored
 *   hashed). Access tokens for the MCP endpoint are signed JWTs, not stored.
 * - `oauthResource` / `oauthClientResource`: the MCP endpoint as a protected resource, and
 *   which clients may ask for it.
 * When a Better Auth upgrade adds fields, add them here and run `pnpm db:generate`.
 */

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { session, user } from "./auth";
import { id } from "./columns";

const createdAt = () => timestamp({ withTimezone: true }).defaultNow();
const updatedAt = () => timestamp({ withTimezone: true }).defaultNow();

export const jwks = pgTable("jwks", {
  id: id(),
  publicKey: text().notNull(),
  privateKey: text().notNull(),
  createdAt: createdAt().notNull(),
  expiresAt: timestamp({ withTimezone: true }),
  alg: text(),
  crv: text(),
});

export const oauthClient = pgTable(
  "oauth_client",
  {
    id: id(),
    clientId: text().notNull().unique(),
    clientSecret: text(),
    /** Set for clients created from a Client ID Metadata Document. */
    clientDiscoveryId: text(),
    disabled: boolean().default(false),
    skipConsent: boolean(),
    enableEndSession: boolean(),
    subjectType: text(),
    scopes: text().array(),
    clientCredentialsScopes: text()
      .array()
      .default(sql`'{}'::text[]`),
    userId: uuid().references(() => user.id),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    /** The app's name, shown on the consent page and the connector settings. */
    name: text(),
    uri: text(),
    icon: text(),
    contacts: text().array(),
    tos: text(),
    policy: text(),
    softwareId: text(),
    softwareVersion: text(),
    softwareStatement: text(),
    redirectUris: text().array().notNull(),
    postLogoutRedirectUris: text().array(),
    backchannelLogoutUri: text(),
    backchannelLogoutSessionRequired: boolean(),
    tokenEndpointAuthMethod: text(),
    applicationType: text(),
    jwks: text(),
    jwksUri: text(),
    grantTypes: text().array(),
    responseTypes: text().array(),
    requirePKCE: boolean("require_pkce"),
    dpopBoundAccessTokens: boolean().default(false),
    referenceId: text(),
    metadata: jsonb(),
  },
  (table) => [index().on(table.userId)],
);

export const oauthResource = pgTable("oauth_resource", {
  id: id(),
  /** The resource's URL (RFC 8707), here the MCP endpoint. */
  identifier: text().notNull().unique(),
  name: text().notNull(),
  accessTokenTtl: integer(),
  refreshTokenTtl: integer(),
  signingAlgorithm: text(),
  signingKeyId: text(),
  allowedScopes: text().array(),
  customClaims: jsonb(),
  dpopBoundAccessTokensRequired: boolean().default(false),
  disabled: boolean().default(false),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
  policyVersion: integer().default(1),
  metadata: jsonb(),
});

export const oauthClientResource = pgTable(
  "oauth_client_resource",
  {
    id: id(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    resourceId: text()
      .notNull()
      .references(() => oauthResource.identifier, { onDelete: "cascade" }),
    metadata: jsonb(),
    createdAt: createdAt(),
  },
  (table) => [
    index().on(table.clientId),
    index().on(table.resourceId),
    uniqueIndex().on(table.clientId, table.resourceId),
  ],
);

export const oauthRefreshToken = pgTable(
  "oauth_refresh_token",
  {
    id: id(),
    token: text().notNull().unique(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId),
    sessionId: uuid().references(() => session.id, { onDelete: "set null" }),
    userId: uuid()
      .notNull()
      .references(() => user.id),
    referenceId: text(),
    authorizationCodeId: text(),
    resources: text().array(),
    requestedUserInfoClaims: text().array(),
    expiresAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    revoked: timestamp({ withTimezone: true }),
    rotatedAt: timestamp({ withTimezone: true }),
    rotationReplayResponse: text(),
    rotationReplayExpiresAt: timestamp({ withTimezone: true }),
    authTime: timestamp({ withTimezone: true }),
    confirmation: jsonb(),
    scopes: text().array().notNull(),
  },
  (table) => [
    index().on(table.clientId),
    index().on(table.sessionId),
    index().on(table.userId),
    index().on(table.authorizationCodeId),
  ],
);

export const oauthAccessToken = pgTable(
  "oauth_access_token",
  {
    id: id(),
    token: text().unique(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId),
    sessionId: uuid().references(() => session.id, { onDelete: "set null" }),
    userId: uuid().references(() => user.id),
    referenceId: text(),
    authorizationCodeId: text(),
    resources: text().array(),
    requestedUserInfoClaims: text().array(),
    refreshId: uuid().references(() => oauthRefreshToken.id),
    expiresAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
    revoked: timestamp({ withTimezone: true }),
    confirmation: jsonb(),
    scopes: text().array().notNull(),
  },
  (table) => [
    index().on(table.clientId),
    index().on(table.sessionId),
    index().on(table.userId),
    index().on(table.authorizationCodeId),
    index().on(table.refreshId),
  ],
);

export const oauthConsent = pgTable(
  "oauth_consent",
  {
    id: id(),
    clientId: text()
      .notNull()
      .references(() => oauthClient.clientId),
    userId: uuid().references(() => user.id),
    referenceId: text(),
    resources: text().array(),
    requestedUserInfoClaims: text().array(),
    scopes: text().array().notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
    /**
     * When the app last used the MCP endpoint for this user. Money's own field (Better Auth
     * doesn't know it): set by the MCP route on every request.
     */
    lastUsedAt: timestamp({ withTimezone: true }),
  },
  (table) => [index().on(table.clientId), index().on(table.userId)],
);

/**
 * Single-use `private_key_jwt` assertion ids (ChatGPT authenticates this way), so an assertion
 * can't be replayed. Its id is a digest of the assertion's jti that Better Auth computes, so it's
 * text.
 */
export const oauthClientAssertion = pgTable("oauth_client_assertion", {
  id: text().primaryKey(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
});
