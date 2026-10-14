import "server-only";

import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Whether `code` is the setup code that lets someone create the first admin on /setup: the
 * deployment's BETTER_AUTH_SECRET, which only the person who deployed the copy knows (they
 * pasted it into Vercel). It keeps a stranger who finds a new copy's address first from
 * claiming its book. Compared as SHA-256 digests in constant time, so neither the length nor
 * the characters leak through timing.
 */
export function isSetupCode(code: string): boolean {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) return false;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(code.trim()), digest(secret.trim()));
}
