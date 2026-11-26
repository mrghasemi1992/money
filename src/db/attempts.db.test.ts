import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAttempts, takeAttempt } from "./attempts";

const LIMIT = { maxAttempts: 3, windowSeconds: 60 };
const START = new Date("2026-10-01T10:00:00Z");

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(START);
});

afterEach(() => {
  vi.useRealTimers();
});

function at(seconds: number): void {
  vi.setSystemTime(START.getTime() + seconds * 1000);
}

describe("takeAttempt", () => {
  it("allows the limit within the window, then refuses until the window ends", async () => {
    expect(await takeAttempt("money:password:1", LIMIT)).toEqual({
      allowed: true,
      retryAfterSeconds: 60,
    });
    at(10);
    expect((await takeAttempt("money:password:1", LIMIT)).allowed).toBe(true);
    at(20);
    expect((await takeAttempt("money:password:1", LIMIT)).allowed).toBe(true);
    at(45);
    expect(await takeAttempt("money:password:1", LIMIT)).toEqual({
      allowed: false,
      retryAfterSeconds: 15,
    });
  });

  it("starts a new window once the first one has passed", async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      await takeAttempt("money:password:1", LIMIT);
    }
    at(60);
    expect(await takeAttempt("money:password:1", LIMIT)).toEqual({
      allowed: true,
      retryAfterSeconds: 60,
    });
    expect((await takeAttempt("money:password:1", LIMIT)).allowed).toBe(true);
  });

  it("lets only the limit through when attempts arrive at the same moment", async () => {
    const results = await Promise.all(
      Array.from({ length: 6 }, () => takeAttempt("money:password:1", LIMIT)),
    );

    expect(results.filter((result) => result.allowed)).toHaveLength(3);
  });

  it("counts each key apart", async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await takeAttempt("money:password:1", LIMIT);
    }

    expect((await takeAttempt("money:password:1", LIMIT)).allowed).toBe(false);
    expect((await takeAttempt("money:password:2", LIMIT)).allowed).toBe(true);
  });
});

describe("clearAttempts", () => {
  it("forgets a key's attempts", async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      await takeAttempt("money:password:1", LIMIT);
    }
    await clearAttempts("money:password:1");

    expect((await takeAttempt("money:password:1", LIMIT)).allowed).toBe(true);
  });
});
