import { beforeEach, describe, expect, it, vi } from "vitest";

import { hasUsers } from "@/db/users";
import { t } from "@/test/messages";
import { auth, outcome, resetServer, setLocale } from "@/test/server";

import { createFirstAdmin } from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/db/users", () => ({ hasUsers: vi.fn() }));

const SECRET = "a-long-random-secret-from-vercel";

const input = {
  code: SECRET,
  name: "سارا",
  username: "sara",
  password: "pool-1405-sara",
};

beforeEach(() => {
  resetServer();
  vi.stubEnv("BETTER_AUTH_SECRET", SECRET);
  vi.mocked(hasUsers).mockResolvedValue(false);
});

describe("createFirstAdmin", () => {
  it("creates an admin in the page's language, with its calendar", async () => {
    setLocale("en");
    expect(await createFirstAdmin(input)).toEqual({ ok: true });
    expect(auth.api.createUser).toHaveBeenCalledWith({
      body: expect.objectContaining({
        name: "سارا",
        password: "pool-1405-sara",
        role: "admin",
        data: { username: "sara", locale: "en", calendar: "gregorian" },
      }),
    });
  });

  it("refuses a wrong setup code, with spaces around the right one accepted", async () => {
    expect(await createFirstAdmin({ ...input, code: "guess" })).toEqual({
      ok: false,
      field: "code",
      error: t("setup.errors.codeWrong"),
    });
    expect(auth.api.createUser).not.toHaveBeenCalled();

    expect(await createFirstAdmin({ ...input, code: ` ${SECRET} ` })).toEqual({
      ok: true,
    });
  });

  it("refuses every code when the deployment has no secret", async () => {
    vi.stubEnv("BETTER_AUTH_SECRET", "");
    expect(await createFirstAdmin(input)).toMatchObject({
      ok: false,
      field: "code",
    });
  });

  it("sends to sign-in once the book has a user, without creating anyone", async () => {
    vi.mocked(hasUsers).mockResolvedValue(true);
    expect(await outcome(() => createFirstAdmin(input))).toBe(
      "redirect /login",
    );
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });

  it("puts a short password on its field", async () => {
    expect(
      await createFirstAdmin({ ...input, password: "short" }),
    ).toMatchObject({
      ok: false,
      field: "password",
    });
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });
});
