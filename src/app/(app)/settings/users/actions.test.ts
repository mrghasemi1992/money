import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { revokeAllConnections } from "@/db/connector";
import { disableUser, getUserStatus, setUserRole } from "@/db/users";
import { t } from "@/test/messages";
import {
  auth,
  outcome,
  resetServer,
  signInAs,
  TEST_USER_ID,
} from "@/test/server";

import {
  changeRole,
  createUser,
  disable,
  enable,
  generatePassword,
  resetPassword,
} from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/db/connector", () => ({ revokeAllConnections: vi.fn() }));
vi.mock("@/db/users", () => ({
  disableUser: vi.fn(),
  getUserStatus: vi.fn(),
  setUserRole: vi.fn(),
}));

const OTHER = "7d6c5b4a-3e2f-4a1b-9c8d-7e6f5a4b3c2d";

beforeEach(() => {
  resetServer();
  vi.mocked(getUserStatus).mockResolvedValue({
    role: "editor",
    disabled: false,
  });
});

describe("every user action", () => {
  it("is for admins only", async () => {
    const calls = [
      () => generatePassword(),
      () => createUser({}),
      () => resetPassword({ userId: OTHER }),
      () => changeRole({ userId: OTHER, role: "viewer" }),
      () => disable({ userId: OTHER }),
      () => enable({ userId: OTHER }),
    ];
    for (const role of ["viewer", "editor"] as const) {
      signInAs(role);
      for (const call of calls) expect(await outcome(call)).toBe("notFound");
    }
    expect(auth.api.setUserPassword).not.toHaveBeenCalled();
    expect(setUserRole).not.toHaveBeenCalled();
    expect(disableUser).not.toHaveBeenCalled();
  });
});

describe("createUser", () => {
  const input = {
    name: "سارا رحیمی",
    username: "sara.rahimi",
    password: "kT7m-Qx4p-Wz9r",
    role: "editor",
    locale: "en",
  };

  it("creates the user with the calendar of their language", async () => {
    signInAs("admin");
    expect(await createUser(input)).toEqual({ ok: true });
    expect(auth.api.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          name: "سارا رحیمی",
          password: "kT7m-Qx4p-Wz9r",
          role: "editor",
          data: {
            username: "sara.rahimi",
            locale: "en",
            calendar: "gregorian",
          },
        }),
      }),
    );
  });

  it("puts a taken username on its field", async () => {
    signInAs("admin");
    vi.mocked(auth.api.createUser).mockRejectedValue(
      new APIError("BAD_REQUEST", { code: "USERNAME_IS_ALREADY_TAKEN" }),
    );
    expect(await createUser(input)).toEqual({
      ok: false,
      field: "username",
      error: t("users.form.errors.usernameTaken"),
    });
  });

  it("refuses a username with characters it can't have", async () => {
    signInAs("admin");
    expect(await createUser({ ...input, username: "سارا" })).toMatchObject({
      ok: false,
      field: "username",
    });
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });
});

describe("resetPassword (#110)", () => {
  it("sets a new password, ends every session, then disconnects the apps", async () => {
    signInAs("admin");
    const order: string[] = [];
    vi.mocked(auth.api.setUserPassword).mockImplementation(async () => {
      order.push("password");
      return {};
    });
    vi.mocked(auth.api.revokeUserSessions).mockImplementation(async () => {
      order.push("sessions");
      return {};
    });
    vi.mocked(revokeAllConnections).mockImplementation(async () => {
      order.push("apps");
      return 1;
    });

    const result = await resetPassword({ userId: OTHER });

    expect(result).toEqual({ ok: true, password: expect.any(String) });
    expect(order).toEqual(["password", "sessions", "apps"]);
    expect(revokeAllConnections).toHaveBeenCalledWith(OTHER);
    const password = result.ok ? result.password : "";
    expect(auth.api.setUserPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { userId: OTHER, newPassword: password },
      }),
    );
  });

  it("doesn't reset the admin's own password, or a user who doesn't exist", async () => {
    signInAs("admin");
    expect(await resetPassword({ userId: TEST_USER_ID })).toEqual({
      ok: false,
      error: t("users.self.password"),
    });
    vi.mocked(getUserStatus).mockResolvedValue(null);
    expect(await resetPassword({ userId: OTHER })).toMatchObject({ ok: false });
    expect(auth.api.setUserPassword).not.toHaveBeenCalled();
    expect(revokeAllConnections).not.toHaveBeenCalled();
  });
});

describe("changeRole and disable", () => {
  it("refuse the admin's own account", async () => {
    signInAs("admin");
    expect(await changeRole({ userId: TEST_USER_ID, role: "viewer" })).toEqual({
      ok: false,
      error: t("users.self.role"),
    });
    expect(await disable({ userId: TEST_USER_ID })).toEqual({
      ok: false,
      error: t("users.self.disable"),
    });
  });

  it("keep the last enabled admin", async () => {
    signInAs("admin");
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "admin",
      disabled: false,
    });
    vi.mocked(setUserRole).mockResolvedValue(false);
    vi.mocked(disableUser).mockResolvedValue(false);

    expect(await changeRole({ userId: OTHER, role: "editor" })).toEqual({
      ok: false,
      error: t("users.lastAdmin"),
    });
    expect(await disable({ userId: OTHER })).toEqual({
      ok: false,
      error: t("users.lastAdmin"),
    });
  });

  it("pass the acting admin to the guarded statement", async () => {
    signInAs("admin");
    vi.mocked(setUserRole).mockResolvedValue(true);
    vi.mocked(disableUser).mockResolvedValue(true);

    expect(await changeRole({ userId: OTHER, role: "viewer" })).toEqual({
      ok: true,
    });
    expect(setUserRole).toHaveBeenCalledWith(TEST_USER_ID, OTHER, "viewer");
    expect(await disable({ userId: OTHER })).toEqual({ ok: true });
    expect(disableUser).toHaveBeenCalledWith(TEST_USER_ID, OTHER);
  });

  it("refuse a role Money doesn't have", async () => {
    signInAs("admin");
    expect(await changeRole({ userId: OTHER, role: "owner" })).toMatchObject({
      ok: false,
    });
    expect(setUserRole).not.toHaveBeenCalled();
  });
});

describe("enable", () => {
  it("unbans a disabled user and leaves an enabled one alone", async () => {
    signInAs("admin");
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "viewer",
      disabled: true,
    });
    expect(await enable({ userId: OTHER })).toEqual({ ok: true });
    expect(auth.api.unbanUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { userId: OTHER } }),
    );

    vi.mocked(auth.api.unbanUser).mockClear();
    vi.mocked(getUserStatus).mockResolvedValue({
      role: "viewer",
      disabled: false,
    });
    expect(await enable({ userId: OTHER })).toEqual({ ok: true });
    expect(auth.api.unbanUser).not.toHaveBeenCalled();
  });
});
