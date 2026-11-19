import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { LATEST_RELEASE_API, RELEASES_URL } from "@/constants/release";
import { server } from "@/test/msw";

import { checkForUpdate } from "./release";

const answer = (body: Record<string, unknown>, status = 200) =>
  server.use(
    http.get(LATEST_RELEASE_API, () => HttpResponse.json(body, { status })),
  );

describe("checkForUpdate", () => {
  it("says a newer release is out, with its page", async () => {
    answer({ tag_name: "v0.8.0", html_url: `${RELEASES_URL}/tag/v0.8.0` });
    expect(await checkForUpdate("0.7.0")).toEqual({
      latest: "0.8.0",
      url: `${RELEASES_URL}/tag/v0.8.0`,
      available: true,
    });
  });

  it("says nothing new for the same version", async () => {
    answer({ tag_name: "v0.7.0", html_url: `${RELEASES_URL}/tag/v0.7.0` });
    expect(await checkForUpdate("0.7.0")).toMatchObject({ available: false });
  });

  it("links only to this repository's releases", async () => {
    answer({ tag_name: "v0.8.0", html_url: "https://evil.example/release" });
    expect(await checkForUpdate("0.7.0")).toMatchObject({ url: RELEASES_URL });
  });

  it("is null when GitHub can't tell, and never throws", async () => {
    answer({ message: "rate limited" }, 403);
    expect(await checkForUpdate("0.7.0")).toBeNull();
    answer({ tag_name: "nightly", html_url: RELEASES_URL });
    expect(await checkForUpdate("0.7.0")).toBeNull();
    server.use(http.get(LATEST_RELEASE_API, () => HttpResponse.error()));
    expect(await checkForUpdate("0.7.0")).toBeNull();
  });
});
