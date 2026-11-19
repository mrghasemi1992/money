/*
 * Browser APIs jsdom doesn't have, for component tests: `matchMedia` (useMediaQuery picks a
 * Dialog on desktop and a Sheet on phones), `ResizeObserver` and `scrollIntoView` (Base UI's
 * popups use them).
 */

type Viewport = "desktop" | "mobile";

let viewport: Viewport = "desktop";

/** Phone or desktop for `matchMedia`: phone queries match only on "mobile". */
export function setViewport(next: Viewport) {
  viewport = next;
}

export function resetViewport() {
  viewport = "desktop";
}

const SIZE = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 812 },
};

/**
 * Evaluates the range queries of src/constants/media.ts («(width < 48rem)»); reduced motion
 * matches, so components skip their animations.
 */
function matches(query: string): boolean {
  if (/prefers-reduced-motion:\s*reduce/.test(query)) return true;
  const range = /\((width|height)\s*(<=|>=|<|>)\s*([\d.]+)(rem|px)\)/.exec(
    query,
  );
  if (!range) return false;
  const [, side, operator, number, unit] = range;
  const size = SIZE[viewport][side as "width" | "height"];
  const limit = Number(number) * (unit === "rem" ? 16 : 1);
  switch (operator) {
    case "<":
      return size < limit;
    case "<=":
      return size <= limit;
    case ">":
      return size > limit;
    default:
      return size >= limit;
  }
}

export function stubBrowserApis() {
  window.matchMedia = (query: string) =>
    ({
      media: query,
      get matches() {
        return matches(query);
      },
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;

  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  Element.prototype.scrollIntoView ??= function () {};
}
