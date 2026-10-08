"use server";

import { refresh } from "next/cache";
import { getTranslations } from "next-intl/server";
import { z } from "zod";

import { requireUser } from "@/auth/session";
import { revokeConnection as revokeGrant } from "@/db/connector";
import type { ActionResult } from "@/types/action";

const revokeSchema = z.object({ clientId: z.string().min(1).max(2048) });

/**
 * Disconnects an app (Claude) from the signed-in user's account: its consent and tokens are
 * deleted, so its next request fails and it has to be allowed again. Any role, for their own
 * connections only.
 */
export async function revokeConnection(input: unknown): Promise<ActionResult> {
  const { user } = await requireUser();
  const parsed = revokeSchema.safeParse(input);
  const t = await getTranslations("connector.revoke");
  if (!parsed.success) return { ok: false, error: t("failed") };
  await revokeGrant(user.id, parsed.data.clientId);
  refresh();
  return { ok: true };
}
