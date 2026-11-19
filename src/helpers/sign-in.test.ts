import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { SIGN_IN_LIMIT } from "@/constants/auth";
import { server } from "@/test/msw";

import { signedOAuthQuery, signInWithUsername } from "./sign-in";

// The login page's fetch is relative; in Node it needs a base, as the browser's page has.
const BASE = "http://money.localhost:3000";
const SIGN_IN = `${BASE}/api/auth/sign-in/username`;
globalThis.location ??= new URL(`${BASE}/login`) as unknown as Location;

const answer = (body: Record<string, unknown>, init?: ResponseInit) =>
  server.use(http.post(SIGN_IN, () => HttpResponse.json(body, init)));

describe("signInWithUsername", () => {
  it("signs in, and continues Claude's authorization where Better Auth says", async () => {
    answer({ token: "t" });
    expect(await signInWithUsername("sara", "pw")).toEqual({
      status: "success",
    });

    let sent: unknown;
    server.use(
      http.post(SIGN_IN, async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ url: "/oauth/consent?sig=x" });
      }),
    );
    expect(
      await signInWithUsername("sara", "pw", "sig=x&ba_param=a&a=1"),
    ).toEqual({
      status: "success",
      redirectTo: "/oauth/consent?sig=x",
    });
    expect(sent).toEqual({
      username: "sara",
      password: "pw",
      oauth_query: "sig=x&ba_param=a&a=1",
    });
  });

  it("never says whether the username or the password was wrong", async () => {
    for (const status of [400, 401, 422]) {
      answer({ code: "INVALID_USERNAME_OR_PASSWORD" }, { status });
      expect(await signInWithUsername("sara", "pw")).toEqual({
        status: "wrong",
      });
    }
  });

  it("tells a disabled user, and a locked-out IP how long to wait", async () => {
    answer({ code: "BANNED_USER" }, { status: 403 });
    expect(await signInWithUsername("reza", "pw")).toEqual({
      status: "disabled",
    });

    answer({}, { status: 429, headers: { "X-Retry-After": "42" } });
    expect(await signInWithUsername("sara", "pw")).toEqual({
      status: "locked",
      retryAfter: 42,
    });
    answer({}, { status: 429 });
    expect(await signInWithUsername("sara", "pw")).toEqual({
      status: "locked",
      retryAfter: SIGN_IN_LIMIT.windowSeconds,
    });
  });

  it("reports a network or server failure", async () => {
    server.use(http.post(SIGN_IN, () => HttpResponse.error()));
    expect(await signInWithUsername("sara", "pw")).toEqual({
      status: "failed",
    });
    answer({}, { status: 500 });
    expect(await signInWithUsername("sara", "pw")).toEqual({
      status: "failed",
    });
  });
});

describe("signedOAuthQuery", () => {
  it("keeps only the signed parameters of the authorization request", () => {
    const query = new URLSearchParams(
      "client_id=c&scope=money&sig=abc&ba_param=client_id&ba_param=scope&next=%2Fevil",
    );
    expect(signedOAuthQuery(query)).toBe(
      "client_id=c&scope=money&sig=abc&ba_param=client_id&ba_param=scope",
    );
  });

  it("is null without a signature or signed names", () => {
    expect(signedOAuthQuery(new URLSearchParams("client_id=c"))).toBeNull();
    expect(signedOAuthQuery(new URLSearchParams("sig=abc"))).toBeNull();
  });
});
