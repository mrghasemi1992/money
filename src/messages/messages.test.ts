import { describe, expect, it } from "vitest";

import en from "./en";
import fa from "./fa";

/*
 * The two languages say the same things. The type check already fails on a missing or extra
 * key (en.ts is typed as Messages); this also checks that each message takes the same values
 * and rich-text tags in both, so a message never shows a raw «{name}» or drops a value.
 */

type Tree = { [key: string]: string | Tree };

function leaves(tree: Tree, prefix = ""): [string, string][] {
  return Object.entries(tree).flatMap(([key, value]) =>
    typeof value === "string"
      ? [[`${prefix}${key}`, value] as [string, string]]
      : leaves(value, `${prefix}${key}.`),
  );
}

/**
 * The values a message shows ({name}) and its tags (<b>…</b>). Plural and select arguments
 * ({countNumber, plural, …}) are left out: English needs plural forms that Persian doesn't.
 */
function slots(message: string): string[] {
  const values = [...message.matchAll(/\{\s*(\w+)\s*(\}|,\s*(\w+))/g)]
    .filter(
      (match) =>
        !["plural", "select", "selectordinal"].includes(match[3] ?? ""),
    )
    .map((match) => `{${match[1]}}`);
  const tags = [...message.matchAll(/<(\w+)>/g)].map(
    (match) => `<${match[1]}>`,
  );
  return [...new Set([...values, ...tags])].sort();
}

const faLeaves = new Map(leaves(fa as unknown as Tree));
const enLeaves = new Map(leaves(en as unknown as Tree));

describe("messages", () => {
  it("have the same keys in Persian and English", () => {
    expect([...enLeaves.keys()].sort()).toEqual([...faLeaves.keys()].sort());
  });

  it("take the same values and tags in both languages", () => {
    const mismatched = [...faLeaves]
      .filter(([key, message]) => {
        const other = enLeaves.get(key);
        return (
          other !== undefined && slots(message).join() !== slots(other).join()
        );
      })
      .map(([key, message]) => ({
        key,
        fa: slots(message),
        en: slots(enLeaves.get(key)!),
      }));
    expect(mismatched).toEqual([]);
  });

  it("have no empty message", () => {
    const empty = [...faLeaves, ...enLeaves]
      .filter(([, message]) => message.trim() === "")
      .map(([key]) => key);
    expect(empty).toEqual([]);
  });
});
