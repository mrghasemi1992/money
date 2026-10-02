/*
 * Creates a user: `pnpm user:create`.
 *
 * Asks for the username, display name, role and password at the prompt (the password is not
 * shown), so they never end up in shell history. Use it to create the first admin, and other
 * users until the user management page exists (Phase 3). Writes to the database in
 * DATABASE_URL from .env.local.
 *
 * Runs with the "react-server" condition, which makes the `server-only` imports of src/auth and
 * src/db no-ops outside Next.js.
 */

import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline/promises";

import { z } from "zod";

import { auth } from "@/auth";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_PATTERN,
  USER_ROLES,
} from "@/constants/user";
import { placeholderEmail } from "@/helpers/user";

const inputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(USERNAME_MIN_LENGTH, `At least ${USERNAME_MIN_LENGTH} characters.`)
    .max(USERNAME_MAX_LENGTH, `At most ${USERNAME_MAX_LENGTH} characters.`)
    .regex(USERNAME_PATTERN, "Only Latin letters, digits, «.» and «_»."),
  name: z.string().trim().min(1, "Enter a display name."),
  role: z.enum(USER_ROLES, {
    error: `One of: ${USER_ROLES.join(", ")}.`,
  }),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, `At least ${PASSWORD_MIN_LENGTH} characters.`)
    .max(PASSWORD_MAX_LENGTH, `At most ${PASSWORD_MAX_LENGTH} characters.`),
});

/** Reads a line without echoing it. */
async function askHidden(question: string): Promise<string> {
  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");
  let value = "";
  try {
    return await new Promise<string>((resolve, reject) => {
      const onData = (chunk: string) => {
        for (const char of chunk) {
          if (char === "\r" || char === "\n" || char === "\u0004") {
            stdin.off("data", onData);
            stdout.write("\n");
            resolve(value);
            return;
          }
          if (char === "\u0003") {
            stdin.off("data", onData);
            reject(new Error("Cancelled."));
            return;
          }
          if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
          else value += char;
        }
      };
      stdin.on("data", onData);
    });
  } finally {
    stdin.setRawMode(false);
    stdin.pause();
  }
}

async function main() {
  if (!stdin.isTTY) {
    throw new Error("Run this in a terminal: it asks for the password.");
  }

  const prompt = createInterface({ input: stdin, output: stdout });
  const username = await prompt.question("Username: ");
  const name = await prompt.question("Display name: ");
  const role =
    (
      await prompt.question(`Role (${USER_ROLES.join(" / ")}) [admin]: `)
    ).trim() || "admin";
  prompt.close();

  const password = await askHidden("Password: ");
  const confirmation = await askHidden("Password again: ");
  if (password !== confirmation) throw new Error("The passwords don't match.");

  const parsed = inputSchema.safeParse({ username, name, role, password });
  if (!parsed.success) {
    const messages = parsed.error.issues.map(
      (issue) => `${issue.path.join(".")}: ${issue.message}`,
    );
    throw new Error(messages.join("\n"));
  }

  // Server-side call without a session: allowed by the admin plugin, and only reachable here.
  const { user } = await auth.api.createUser({
    body: {
      email: placeholderEmail(),
      password: parsed.data.password,
      name: parsed.data.name,
      role: parsed.data.role,
      data: { username: parsed.data.username },
    },
  });

  console.log(
    `Created ${parsed.data.role} "${user.name}" (${parsed.data.username}).`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
