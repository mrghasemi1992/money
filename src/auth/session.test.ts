import { beforeEach, describe, expect, it, vi } from "vitest";

import { PATHNAME_HEADER } from "@/constants/auth";
import {
  outcome,
  resetServer,
  setRequestHeaders,
  signInAs,
} from "@/test/server";

import { getSession, requireAdmin, requireUser, requireWrite } from "./session";

vi.mock("@/auth", () => import("@/test/server"));
vi.mock("next/headers", () => import("@/test/server"));
vi.mock("next/navigation", () => import("@/test/server"));

beforeEach(() => resetServer());

describe("requireUser", () => {
  it("sends a visitor without a session to /login, back to the page they asked for", async () => {
    setRequestHeaders({ [PATHNAME_HEADER]: "/budgets?month=1405-08" });
    expect(await outcome(requireUser)).toBe(
      `redirect /login?${new URLSearchParams({ next: "/budgets?month=1405-08" })}`,
    );
  });

  it("doesn't take a return path that leaves the site", async () => {
    setRequestHeaders({ [PATHNAME_HEADER]: "//evil.example" });
    expect(await outcome(requireUser)).toBe("redirect /login");
  });

  it("lets every role read", async () => {
    for (const role of ["viewer", "editor", "admin"] as const) {
      signInAs(role);
      expect(await outcome(requireUser)).toBe("allowed");
    }
  });

  it("treats a disabled (banned) user as signed out", async () => {
    signInAs("admin", { banned: true });
    expect(await getSession()).toBeNull();
    expect(await outcome(requireUser)).toBe("redirect /login");
  });
});

describe("requireWrite", () => {
  it("answers viewers with «not found»", async () => {
    signInAs("viewer");
    expect(await outcome(requireWrite)).toBe("notFound");
  });

  it("lets editors and admins write", async () => {
    for (const role of ["editor", "admin"] as const) {
      signInAs(role);
      expect(await outcome(requireWrite)).toBe("allowed");
    }
  });

  it("treats an unknown stored role as a viewer", async () => {
    signInAs("superuser" as never);
    expect(await outcome(requireWrite)).toBe("notFound");
  });
});

describe("requireAdmin", () => {
  it("lets only admins manage users", async () => {
    signInAs("admin");
    expect(await outcome(requireAdmin)).toBe("allowed");
    for (const role of ["viewer", "editor"] as const) {
      signInAs(role);
      expect(await outcome(requireAdmin)).toBe("notFound");
    }
  });
});
