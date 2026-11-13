import "server-only";

import { eq, sql } from "drizzle-orm";

import { db } from "./index";
import { rateLimit } from "./schema";

/*
 * Attempt limits for Server Actions. Better Auth's rate limits only cover HTTP requests to
 * /api/auth, not its endpoints called through `auth.api`, so an action that checks a password
 * counts its own attempts. They share Better Auth's `rate_limit` table under keys that start
 * with `money:`; for these keys `last_request` is when the window started.
 */

interface AttemptLimit {
  maxAttempts: number;
  windowSeconds: number;
}

/**
 * Counts one attempt for `key` and tells whether it is allowed: at most `maxAttempts` in a window
 * that starts at the first attempt. Counting first, in one statement, means attempts sent at the
 * same moment can't all slip past the limit. When refused, `retryAfterSeconds` is the rest of
 * the window.
 */
export async function takeAttempt(
  key: string,
  { maxAttempts, windowSeconds }: AttemptLimit,
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const expired = sql`${rateLimit.lastRequest} <= ${windowStart}`;
  const [row] = await db
    .insert(rateLimit)
    .values({ key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql`case when ${expired} then ${now} else ${rateLimit.lastRequest} end`,
      },
    })
    .returning({ count: rateLimit.count, startedAt: rateLimit.lastRequest });

  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((row.startedAt + windowSeconds * 1000 - now) / 1000),
  );
  return { allowed: row.count <= maxAttempts, retryAfterSeconds };
}

/** Forgets the attempts for `key`, after one succeeded. */
export async function clearAttempts(key: string): Promise<void> {
  await db.delete(rateLimit).where(eq(rateLimit.key, key));
}
