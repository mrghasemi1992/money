import { verifyJwsAccessToken } from "better-auth/oauth2";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { checkMcpGrant } from "@/db/connector";
import type { McpUser } from "@/types/connector";

import { getMcpUser, verifyMcpToken } from "./auth";

vi.mock("better-auth/oauth2", () => ({ verifyJwsAccessToken: vi.fn() }));
vi.mock("@/auth", () => ({ auth: { api: { getJwks: vi.fn() } } }));
vi.mock("@/auth/urls", () => ({
  getIssuerUrl: () => "https://money.example/api/auth",
  getMcpResourceUrl: () => "https://money.example/mcp",
}));
vi.mock("@/db/connector", () => ({ checkMcpGrant: vi.fn() }));

const CLAUDE = "https://claude.ai/oauth/mcp-oauth-client-metadata";
const request = new Request("https://money.example/mcp", { method: "POST" });

const user: McpUser = {
  id: "user-1",
  name: "سارا",
  role: "editor",
  disabled: false,
  locale: "fa",
  calendar: "jalali",
  rialUnit: "rial",
  timeZone: null,
};

function token(payload: Record<string, unknown>) {
  vi.mocked(verifyJwsAccessToken).mockResolvedValue({
    sub: "user-1",
    azp: CLAUDE,
    scope: "money offline_access",
    exp: 1_900_000_000,
    ...payload,
  } as never);
}

beforeEach(() => {
  vi.mocked(checkMcpGrant).mockResolvedValue(user);
});

describe("verifyMcpToken", () => {
  it("accepts a valid token with a live grant and returns the user, read fresh", async () => {
    token({});

    const info = await verifyMcpToken(request, "jwt");

    expect(info).toMatchObject({
      token: "jwt",
      clientId: CLAUDE,
      scopes: ["money", "offline_access"],
      expiresAt: 1_900_000_000,
      extra: { user },
    });
    expect(info?.resource?.href).toBe("https://money.example/mcp");
    expect(getMcpUser(info)).toEqual(user);
    // Issued by this app, for this MCP endpoint.
    expect(verifyJwsAccessToken).toHaveBeenCalledWith(
      "jwt",
      expect.objectContaining({
        verifyOptions: {
          issuer: "https://money.example/api/auth",
          audience: "https://money.example/mcp",
        },
      }),
    );
  });

  it("refuses a request without a token, or with one that doesn't verify", async () => {
    expect(await verifyMcpToken(request)).toBeUndefined();
    vi.mocked(verifyJwsAccessToken).mockRejectedValue(
      new Error("bad signature"),
    );
    expect(await verifyMcpToken(request, "forged")).toBeUndefined();
    expect(checkMcpGrant).not.toHaveBeenCalled();
  });

  // #111: anyone can publish a client metadata document; only Claude's and ChatGPT's count.
  it("refuses a token issued to an app that may not connect, before the database", async () => {
    token({ azp: "https://claude.ai.evil.example/client.json" });
    expect(await verifyMcpToken(request, "jwt")).toBeUndefined();
    expect(checkMcpGrant).not.toHaveBeenCalled();
  });

  it("refuses a sender-constrained (DPoP) token", async () => {
    token({ cnf: { jkt: "thumbprint" } });
    expect(await verifyMcpToken(request, "jwt")).toBeUndefined();
  });

  it("refuses a token without a user or a client", async () => {
    token({ sub: undefined });
    expect(await verifyMcpToken(request, "jwt")).toBeUndefined();
    token({ azp: 42 });
    expect(await verifyMcpToken(request, "jwt")).toBeUndefined();
  });

  it("stops working at once when the user revoked the app or was disabled", async () => {
    token({});
    vi.mocked(checkMcpGrant).mockResolvedValue(null);
    expect(await verifyMcpToken(request, "jwt")).toBeUndefined();

    vi.mocked(checkMcpGrant).mockResolvedValue({ ...user, disabled: true });
    expect(await verifyMcpToken(request, "jwt")).toBeUndefined();
    expect(checkMcpGrant).toHaveBeenCalledWith("user-1", CLAUDE);
  });
});

describe("getMcpUser", () => {
  it("is null for a request that wasn't verified", () => {
    expect(getMcpUser(undefined)).toBeNull();
    expect(getMcpUser({ token: "x", clientId: "y", scopes: [] })).toBeNull();
  });
});
