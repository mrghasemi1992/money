import { beforeEach, describe, expect, it, vi } from "vitest";

import { revokeConnection as revokeGrant } from "@/db/connector";
import { outcome, resetServer, signInAs, TEST_USER_ID } from "@/test/server";

import { revokeConnection } from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/db/connector", () => ({ revokeConnection: vi.fn() }));

beforeEach(() => resetServer());

describe("revokeConnection", () => {
  it("lets any role disconnect their own apps, and only theirs", async () => {
    signInAs("viewer");
    expect(
      await revokeConnection({
        clientId: "https://claude.ai/oauth/client.json",
        userId: "someone-else",
      }),
    ).toEqual({ ok: true });
    expect(revokeGrant).toHaveBeenCalledWith(
      TEST_USER_ID,
      "https://claude.ai/oauth/client.json",
    );
  });

  it("sends signed-out visitors to sign in", async () => {
    expect(await outcome(() => revokeConnection({ clientId: "x" }))).toBe(
      "redirect /login",
    );
    expect(revokeGrant).not.toHaveBeenCalled();
  });
});
