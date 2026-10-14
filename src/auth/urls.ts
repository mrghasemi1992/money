import "server-only";

import { AUTH_BASE_PATH, MCP_PATH } from "@/constants/connector";

/*
 * The URLs the Claude connector is built on. OAuth ties tokens to fixed URLs (the issuer and
 * the MCP server's resource identifier), so unlike sign-in they can't follow whichever host a
 * request came in on:
 * - BETTER_AUTH_URL when it is set (local development, or a production domain chosen by hand).
 * - Production on Vercel without it: the project's production domain
 *   (`VERCEL_PROJECT_PRODUCTION_URL`: its shortest custom domain, otherwise its vercel.app
 *   domain), so a copy made with the Deploy button needs no URL setting. A domain added later
 *   applies from the next deployment.
 * - Previews: the branch URL Vercel gives every branch (`VERCEL_BRANCH_URL`). Connect Claude to
 *   a preview through that URL, not the deployment's own one.
 */

/** The production domain on a Vercel production deployment, otherwise undefined. */
export function getVercelProductionHost(): string | undefined {
  if (process.env.VERCEL_ENV !== "production") return undefined;
  return process.env.VERCEL_PROJECT_PRODUCTION_URL || undefined;
}

/** The app's public origin, without a trailing slash. */
export function getAppUrl(): string {
  const configured = process.env.BETTER_AUTH_URL;
  if (configured) return configured.replace(/\/+$/, "");
  const production = getVercelProductionHost();
  if (production) return `https://${production}`;
  const branch = process.env.VERCEL_BRANCH_URL;
  if (branch) return `https://${branch}`;
  return "http://localhost:3000";
}

/**
 * The MCP endpoint's URL: what users paste into Claude and what access tokens are bound to
 * (RFC 8707 `resource`). Over plain HTTP only `localhost` is accepted as a resource, so the
 * local `money.localhost` becomes `localhost` here (the same dev server answers both).
 */
export function getMcpResourceUrl(): string {
  const url = new URL(MCP_PATH, getAppUrl());
  if (url.protocol === "http:" && url.hostname.endsWith(".localhost")) {
    url.hostname = "localhost";
  }
  return url.toString();
}

/** The OAuth issuer: Better Auth's base URL. */
export function getIssuerUrl(): string {
  return `${getAppUrl()}${AUTH_BASE_PATH}`;
}
