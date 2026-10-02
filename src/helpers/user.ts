import { randomUUID } from "node:crypto";

/**
 * Better Auth requires a unique email, but Money signs in by username and has no use for one.
 * Users get a random address on the reserved `.invalid` domain, which can never receive mail.
 */
export function placeholderEmail(): string {
  return `${randomUUID()}@users.money.invalid`;
}
