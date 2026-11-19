import { APIError } from "better-auth/api";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PASSWORD_CHANGE_LIMIT } from "@/constants/auth";
import { clearAttempts, takeAttempt } from "@/db/attempts";
import { getBookSettings, setBookCurrency } from "@/db/book";
import { revokeAllConnections } from "@/db/connector";
import { updateUserPreferences } from "@/db/users";
import { t } from "@/test/messages";
import {
  auth,
  outcome,
  resetServer,
  signInAs,
  TEST_USER_ID,
} from "@/test/server";

import {
  changePassword,
  updateBookCurrency,
  updateDisplayPreferences,
  updateProfile,
} from "./actions";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));
vi.mock("next/cache", () => import("@/test/server"));
vi.mock("next-intl/server", () => import("@/test/server"));
vi.mock("@/db/attempts", () => ({
  takeAttempt: vi.fn(),
  clearAttempts: vi.fn(),
}));
vi.mock("@/db/book", () => ({
  getBookSettings: vi.fn(),
  setBookCurrency: vi.fn(),
}));
vi.mock("@/db/connector", () => ({ revokeAllConnections: vi.fn() }));
vi.mock("@/db/users", () => ({ updateUserPreferences: vi.fn() }));

beforeEach(() => {
  resetServer();
  vi.mocked(takeAttempt).mockResolvedValue({
    allowed: true,
    retryAfterSeconds: 900,
  });
});

const change = {
  currentPassword: "old-password-1",
  newPassword: "new-password-2",
};

describe("changePassword (#110, #116)", () => {
  it("signs out other sessions and disconnects the user's apps after a change", async () => {
    signInAs("viewer");

    expect(await changePassword(change)).toEqual({ ok: true });
    expect(auth.api.changePassword).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { ...change, revokeOtherSessions: true },
      }),
    );
    expect(revokeAllConnections).toHaveBeenCalledWith(TEST_USER_ID);
    expect(clearAttempts).toHaveBeenCalledWith(
      `money:change-password:${TEST_USER_ID}`,
    );
  });

  it("keeps the apps connected and counts the try when the current password is wrong", async () => {
    signInAs("editor");
    vi.mocked(auth.api.changePassword).mockRejectedValue(
      new APIError("BAD_REQUEST", { code: "INVALID_PASSWORD" }),
    );

    expect(await changePassword(change)).toEqual({
      ok: false,
      field: "current",
      error: t("settings.password.currentWrong"),
    });
    expect(revokeAllConnections).not.toHaveBeenCalled();
    expect(clearAttempts).not.toHaveBeenCalled();
    expect(takeAttempt).toHaveBeenCalledWith(
      `money:change-password:${TEST_USER_ID}`,
      PASSWORD_CHANGE_LIMIT,
    );
  });

  it("refuses a try past the limit before asking Better Auth", async () => {
    signInAs("editor");
    vi.mocked(takeAttempt).mockResolvedValue({
      allowed: false,
      retryAfterSeconds: 61,
    });

    expect(await changePassword(change)).toEqual({
      ok: false,
      field: "current",
      error: t("settings.password.tooManyAttempts", { minutes: "۲" }),
    });
    expect(auth.api.changePassword).not.toHaveBeenCalled();
  });

  it("checks the input before counting a try", async () => {
    signInAs("editor");

    expect(
      await changePassword({
        currentPassword: "same-password",
        newPassword: "same-password",
      }),
    ).toEqual({
      ok: false,
      field: "new",
      error: t("settings.password.newSame"),
    });
    expect(
      await changePassword({ currentPassword: "", newPassword: "x" }),
    ).toMatchObject({
      ok: false,
      field: "current",
    });
    expect(takeAttempt).not.toHaveBeenCalled();
  });
});

describe("updateProfile", () => {
  it("saves a trimmed display name for any role", async () => {
    signInAs("viewer");
    expect(await updateProfile({ name: "  سارا  " })).toEqual({ ok: true });
    expect(auth.api.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { name: "سارا" } }),
    );
  });

  it("refuses an empty name", async () => {
    signInAs("viewer");
    expect(await updateProfile({ name: "   " })).toEqual({
      ok: false,
      error: t("settings.profile.displayNameMissing"),
    });
  });
});

describe("updateDisplayPreferences", () => {
  it("saves the calendar of the signed-in user only", async () => {
    signInAs("viewer");
    expect(await updateDisplayPreferences({ calendar: "gregorian" })).toEqual({
      ok: true,
    });
    expect(updateUserPreferences).toHaveBeenCalledWith(TEST_USER_ID, {
      calendar: "gregorian",
    });
  });

  it("refuses fields it doesn't know, such as a role", async () => {
    signInAs("viewer");
    expect(
      await updateDisplayPreferences({ calendar: "jalali", role: "admin" }),
    ).toMatchObject({ ok: false });
    expect(updateUserPreferences).not.toHaveBeenCalled();
  });
});

describe("updateBookCurrency", () => {
  it("is for admins only", async () => {
    for (const role of ["viewer", "editor"] as const) {
      signInAs(role);
      expect(await outcome(() => updateBookCurrency("USD"))).toBe("notFound");
    }
    expect(setBookCurrency).not.toHaveBeenCalled();
  });

  it("is refused once the book holds amounts", async () => {
    signInAs("admin");
    vi.mocked(getBookSettings).mockResolvedValue({ currency: "IRR" });
    vi.mocked(setBookCurrency).mockResolvedValue(false);

    expect(await updateBookCurrency("USD")).toEqual({
      ok: false,
      error: t("settings.book.locked"),
    });
  });

  it("does nothing when the currency doesn't change", async () => {
    signInAs("admin");
    vi.mocked(getBookSettings).mockResolvedValue({ currency: "EUR" });

    expect(await updateBookCurrency("EUR")).toEqual({ ok: true });
    expect(setBookCurrency).not.toHaveBeenCalled();
  });
});
