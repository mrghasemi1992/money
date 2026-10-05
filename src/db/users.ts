import "server-only";

import { eq } from "drizzle-orm";

import type { UserPreferences } from "@/types/preferences";

import { db } from "./index";
import { user } from "./schema";

/** Saves some of a user's display preferences. The caller checks who may do this. */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<UserPreferences>,
): Promise<void> {
  await db.update(user).set(preferences).where(eq(user.id, userId));
}
