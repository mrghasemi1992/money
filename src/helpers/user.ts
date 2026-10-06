import { randomInt, randomUUID } from "node:crypto";

import {
  TEMPORARY_PASSWORD_ALPHABET,
  TEMPORARY_PASSWORD_GROUP_LENGTH,
  TEMPORARY_PASSWORD_GROUPS,
} from "@/constants/user";

/**
 * Better Auth requires a unique email, but Money signs in by username and has no use for one.
 * Users get a random address on the reserved `.invalid` domain, which can never receive mail.
 */
export function placeholderEmail(): string {
  return `${randomUUID()}@users.money.invalid`;
}

/**
 * A temporary password such as «kT7m-Qx4p-Wz9r», from the operating system's secure random
 * source (`randomInt` picks without bias). Server only: it is shown once to the admin and only
 * its hash is stored.
 */
export function generateTemporaryPassword(): string {
  const group = () =>
    Array.from(
      { length: TEMPORARY_PASSWORD_GROUP_LENGTH },
      () =>
        TEMPORARY_PASSWORD_ALPHABET[
          randomInt(TEMPORARY_PASSWORD_ALPHABET.length)
        ],
    ).join("");
  return Array.from({ length: TEMPORARY_PASSWORD_GROUPS }, group).join("-");
}
