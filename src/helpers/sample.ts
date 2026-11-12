import { cloneElement, isValidElement } from "react";

import { SAMPLE_TEXT_EN } from "@/constants/sample-text";
import type { Locale } from "@/types/locale";

/*
 * Storybook only. Sample data and story copy are written in Persian; with the language toolbar on
 * English they are swapped for their English (SAMPLE_TEXT_EN) at render time, so no story shows
 * Persian in an English interface.
 */

let sampleLocale: Locale = "fa";

/** The language toolbar's choice, set by the preview decorator before every story renders. */
export function setSampleLocale(locale: Locale) {
  sampleLocale = locale;
}

const DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const PERSIAN_PUNCTUATION: Record<string, string> = {
  "٬": ",",
  "٫": ".",
  "٪": "%",
  "،": ",",
};
const ONLY_PERSIAN_DIGITS = /^[\s۰-۹٬٫٪،:/.+−-]+$/;

/** Persian text in English: from the dictionary, or digits and punctuation converted. */
export function sampleText(text: string, locale: Locale): string {
  if (locale !== "en") return text;
  const translated = SAMPLE_TEXT_EN[text];
  if (translated !== undefined) return translated;
  if (ONLY_PERSIAN_DIGITS.test(text)) {
    return text.replace(
      /[۰-۹٬٫٪،]/g,
      (char) => PERSIAN_PUNCTUATION[char] ?? String(DIGITS.indexOf(char)),
    );
  }
  return text;
}

function isPlainObject(value: object): value is Record<string, unknown> {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

const cache = new WeakMap<object, unknown>();

/**
 * A string, or every string inside plain objects, arrays, elements and promises, in the toolbar's
 * language. Anything else (functions, dates, class instances) is returned as it is.
 * Results are cached per object, so a story's arguments keep their identity between renders.
 */
export function sample<T>(value: T): T {
  if (sampleLocale !== "en") return value;
  return translate(value, sampleLocale) as T;
}

function translate(value: unknown, locale: Locale): unknown {
  if (typeof value === "string") return sampleText(value, locale);
  if (typeof value !== "object" || value === null) return value;
  const key = value;
  const hit = cache.get(key);
  if (hit !== undefined) return hit;

  let result: unknown = value;
  if (Array.isArray(value)) {
    result = value.map((item) => translate(item, locale));
  } else if (isValidElement<Record<string, unknown>>(value)) {
    result = cloneElement(
      value,
      translate(value.props, locale) as Record<string, unknown>,
    );
  } else if (value instanceof Promise) {
    result = value.then((resolved) => translate(resolved, locale));
  } else if (isPlainObject(value)) {
    result = Object.fromEntries(
      Object.entries(value).map(([name, item]) => [
        name,
        translate(item, locale),
      ]),
    );
  }
  cache.set(key, result);
  return result;
}
