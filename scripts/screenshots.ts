/**
 * Takes the user guide's screenshots (docs/assets/user-guide/<locale>/<shot>.png) from Storybook
 * stories, which run on sample data, so no real book ever appears in them. Each shot is taken in
 * Persian and English, and gets numbered callouts that the guides explain.
 *
 *   pnpm storybook               (in another terminal)
 *   pnpm docs:screenshots        every shot
 *   pnpm docs:screenshots budgets transactions
 *
 * STORYBOOK_URL overrides the Storybook address (default http://money.localhost:6006).
 *
 * A callout's target is found by role and accessible name, with the name taken from the app's
 * own messages, so one definition works in both languages. Its badge sits on a corner of the
 * outline, on the start side unless `corner` says otherwise, so it moves with the direction.
 * Retake the screenshots when a screen in them changes, in the same pull request.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium, type Locator, type Page } from "playwright";

import { MESSAGES } from "../src/messages";
import type { Messages } from "../src/messages/fa";
import type { Locale } from "../src/types/locale";

const STORYBOOK_URL =
  process.env.STORYBOOK_URL ?? "http://money.localhost:6006";
const OUT_DIR = path.join(process.cwd(), "docs/assets/user-guide");
const LOCALES: Locale[] = ["fa", "en"];

/** The toolbar settings each language is shown with. */
const GLOBALS: Record<Locale, string> = {
  fa: "locale:fa;calendar:jalali;money:rial;theme:light",
  en: "locale:en;calendar:gregorian;money:USD;theme:light",
};

const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };

/** `around` value: the closest section, region or card (a box with a border and round corners). */
const CARD = "card";

type Text = (m: Messages) => string;
type Role = Parameters<Page["getByRole"]>[0];

type Target =
  | { role: Role; name?: Text; startsWith?: boolean; nth?: number }
  | { text: Text; nth?: number }
  | { css: string; nth?: number };

type Callout = {
  target: Target;
  /** Outline this ancestor of the target instead: a CSS selector for `closest`, or `CARD`. */
  around?: string;
  /** Which corner of the outline the badge sits on (default top start). */
  corner?: "top-start" | "top-end" | "bottom-start" | "bottom-end";
};

type Shot = {
  /** The story id, or one per language when a story's sample data is fixed to one calendar. */
  story: string | Record<Locale, string>;
  viewport?: { width: number; height: number };
  /** Capture the whole page rather than the viewport. */
  fullPage?: boolean;
  callouts: Callout[];
};

const SHOTS: Record<string, Shot> = {
  shell: {
    story: "components-appshell--admin",
    callouts: [
      { target: { role: "navigation", name: (m) => m.shell.sections } },
      { target: { role: "button", name: (m) => m.shell.collapse } },
      { target: { role: "button", name: (m) => m.addTransaction.title } },
      {
        target: { role: "button", name: (m) => m.shell.account },
        corner: "top-end",
      },
    ],
  },
  "shell-phone": {
    story: "components-appshell--mobile",
    viewport: PHONE,
    callouts: [
      {
        target: { role: "navigation", name: (m) => m.shell.sections },
        corner: "top-start",
      },
      {
        target: { role: "button", name: (m) => m.nav.more },
        corner: "top-end",
      },
      {
        target: {
          role: "button",
          name: (m) => m.addTransaction.title,
          nth: -1,
        },
        corner: "top-end",
      },
      { target: { role: "button", name: (m) => m.shell.account } },
    ],
  },
  "first-run": {
    // The card numbers its own steps.
    story: "components-firstrun--editor",
    viewport: { width: 820, height: 520 },
    callouts: [],
  },
  dashboard: {
    story: "components-dashboard--populated",
    fullPage: true,
    callouts: [
      {
        target: { role: "link", name: (m) => m.dashboard.unknown.action },
        around: CARD,
      },
      { target: { role: "region", name: (m) => m.dashboard.balances.title } },
      { target: { text: (m) => m.dashboard.month.title }, around: CARD },
      { target: { text: (m) => m.dashboard.recent.title }, around: CARD },
      { target: { text: (m) => m.dashboard.budgets.title }, around: CARD },
      { target: { text: (m) => m.dashboard.spending.title }, around: CARD },
    ],
  },
  "transaction-form": {
    story: "components-transactiondialog--new",
    viewport: { width: 1280, height: 900 },
    callouts: [
      { target: { role: "radiogroup", name: (m) => m.transactions.form.type } },
      {
        target: { role: "textbox", name: (m) => m.transactions.form.amount },
        around: "div",
      },
      { target: { role: "button", name: (m) => m.transactions.form.date } },
      {
        target: { role: "combobox", name: (m) => m.transactions.form.account },
      },
      {
        target: {
          role: "combobox",
          name: (m) => m.transactions.form.category,
        },
        around: "div",
      },
      {
        // Its accessible name ends with «(اختیاری)» / “(optional)”.
        target: {
          role: "combobox",
          name: (m) => m.transactions.form.tags,
          startsWith: true,
        },
        around: "div",
      },
      {
        target: {
          role: "button",
          name: (m) => m.transactions.form.submitAnother,
        },
      },
    ],
  },
  transactions: {
    story: {
      fa: "components-transactions--default",
      en: "components-transactions--english",
    },
    fullPage: true,
    callouts: [
      {
        target: { role: "button", name: (m) => m.calendar.previousMonth },
        around: "div",
      },
      { target: { css: "dl" }, around: CARD },
      {
        target: { role: "button", name: (m) => m.transactions.filters.button },
      },
      { target: { role: "heading", nth: 1 } },
      {
        target: { role: "button", name: (m) => m.transactions.list.edit },
        around: "li",
      },
      {
        target: { role: "button", name: (m) => m.transactions.list.edit },
        corner: "top-end",
      },
    ],
  },
  accounts: {
    story: "components-accountsettings--default",
    fullPage: true,
    callouts: [
      { target: { role: "button", name: (m) => m.accounts.add } },
      { target: { text: (m) => m.accounts.total }, around: CARD },
      { target: { role: "list", name: (m) => m.accounts.list } },
      {
        target: { role: "button", name: (m) => m.accounts.menu },
        corner: "top-end",
      },
      { target: { role: "button", name: (m) => m.accounts.archived } },
    ],
  },
  categories: {
    story: "components-categorysettings--default",
    fullPage: true,
    callouts: [
      { target: { role: "radiogroup", name: (m) => m.categories.type } },
      { target: { role: "button", name: (m) => m.categories.add } },
      {
        target: {
          role: "button",
          name: (m) => m.categories.addSubcategoryLabel,
        },
      },
      {
        target: { role: "button", name: (m) => m.categories.menu },
        corner: "top-end",
      },
      { target: { role: "button", name: (m) => m.categories.archived } },
    ],
  },
  budgets: {
    story: "components-budgets--default",
    fullPage: true,
    callouts: [
      {
        target: { role: "button", name: (m) => m.calendar.previousMonth },
        around: "div",
      },
      {
        target: { role: "meter", name: (m) => m.budgets.summary.total },
        around: CARD,
      },
      { target: { role: "list", name: (m) => m.budgets.list.label } },
      { target: { text: (m) => m.budgets.unbudgeted.title }, around: CARD },
      { target: { role: "button", name: (m) => m.budgets.add } },
    ],
  },
  reports: {
    story: "components-reports--six-months",
    fullPage: true,
    callouts: [
      { target: { role: "radiogroup", name: (m) => m.reports.period } },
      { target: { role: "navigation", name: (m) => m.reports.tabs.label } },
      { target: { role: "region", name: (m) => m.reports.summary.income } },
      { target: { role: "region", name: (m) => m.reports.movers.title } },
      {
        target: { role: "radiogroup", name: (m) => m.chart.view },
        corner: "top-end",
      },
    ],
  },
  "import-export": {
    story: "components-importexport--default",
    fullPage: true,
    callouts: [
      {
        target: {
          role: "radiogroup",
          name: (m) => m.importExport.export.range,
        },
      },
      {
        target: {
          role: "button",
          name: (m) => m.importExport.export.download,
        },
      },
      {
        target: { text: (m) => m.importExport.import.steps.upload },
        around: "ol, ul",
      },
      {
        target: {
          role: "button",
          name: (m) => m.importExport.import.upload.choose,
        },
      },
    ],
  },
  connector: {
    story: "components-connectorsettings--default",
    fullPage: true,
    callouts: [
      { target: { role: "button", name: (m) => m.connector.url.copyLabel } },
      { target: { role: "heading", name: (m) => m.connector.steps.title } },
      { target: { text: (m) => m.connector.apps.title }, around: CARD },
      { target: { text: (m) => m.connector.examples.title }, around: CARD },
    ],
  },
  settings: {
    story: "components-settings--admin",
    fullPage: true,
    callouts: [
      { target: { text: (m) => m.settings.profile.title }, around: CARD },
      {
        target: { text: (m) => m.settings.password.title, nth: 0 },
        around: CARD,
      },
      { target: { text: (m) => m.settings.display.title }, around: CARD },
      { target: { text: (m) => m.settings.book.title }, around: CARD },
    ],
  },
  users: {
    story: "components-usermanagement--default",
    fullPage: true,
    callouts: [
      { target: { role: "button", name: (m) => m.users.newUser } },
      {
        target: { role: "searchbox", name: (m) => m.users.search },
        around: "div",
      },
      { target: { role: "row", nth: 1 } },
      {
        target: { role: "button", name: (m) => m.users.menu },
        corner: "top-end",
      },
    ],
  },
};

/** A message as an accessible-name matcher: up to its first placeholder, if it has one. */
function nameMatcher(text: string, startsWith = false): string | RegExp {
  const brace = text.indexOf("{");
  if (brace === -1 && !startsWith) return text;
  const start = (brace === -1 ? text : text.slice(0, brace)).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
  return new RegExp(`^${start}`);
}

function locate(page: Page, target: Target, m: Messages): Locator {
  let found: Locator;
  if ("role" in target) {
    found = page.getByRole(target.role, {
      ...(target.name
        ? { name: nameMatcher(target.name(m), target.startsWith), exact: true }
        : {}),
    });
  } else if ("text" in target) {
    found = page.getByText(nameMatcher(target.text(m)), { exact: true });
  } else {
    found = page.locator(target.css);
  }
  const nth = target.nth ?? 0;
  return nth === -1 ? found.last() : found.nth(nth);
}

type Box = { x: number; y: number; width: number; height: number };

async function outlineBox(found: Locator, around?: string): Promise<Box> {
  const element = await found.elementHandle({ timeout: 10_000 });
  if (!element) throw new Error("not found");
  const box = await element.evaluate((el, selector) => {
    // No named functions in here: tsx would wrap them in a helper the page doesn't have.
    let target: Element = el;
    if (selector === "card") {
      for (let node = el.parentElement; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (
          node.matches("section, article") ||
          (style.borderTopStyle !== "none" &&
            parseFloat(style.borderTopWidth) > 0 &&
            parseFloat(style.borderTopLeftRadius) > 0)
        ) {
          target = node;
          break;
        }
      }
    } else if (selector) {
      target = el.parentElement?.closest(selector) ?? el;
    }
    const rect = target.getBoundingClientRect();
    return {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    };
  }, around ?? null);
  return box;
}

/** Draws the outlines and badges over the page (the pado callouts, positioned for the document). */
async function drawCallouts(
  page: Page,
  items: { box: Box; label: string; corner: string }[],
) {
  await page.evaluate((list) => {
    const COLOR = "#d6336c";
    const BADGE = 26;
    document.getElementById("guide-callouts")?.remove();
    const rtl = document.documentElement.dir === "rtl";
    const width = document.documentElement.scrollWidth;
    const overlay = document.createElement("div");
    overlay.id = "guide-callouts";
    overlay.style.cssText =
      "position:absolute;inset:0 auto auto 0;width:100%;pointer-events:none;z-index:2147483647;";
    for (const { box, label, corner } of list) {
      const left = Math.max(box.x - 4, 2);
      const top = Math.max(box.y - 4, 2);
      const right = Math.min(box.x + box.width + 4, width - 2);
      const bottom = box.y + box.height + 4;

      const outline = document.createElement("div");
      outline.style.cssText = [
        "position:absolute",
        `left:${left}px`,
        `top:${top}px`,
        `width:${right - left}px`,
        `height:${bottom - top}px`,
        `border:2px dashed ${COLOR}`,
        "border-radius:10px",
        "box-sizing:border-box",
      ].join(";");
      overlay.append(outline);

      const [edge, side] = corner.split("-");
      const atLeft = (side === "start") !== rtl;
      const cx = Math.min(
        Math.max(atLeft ? left : right, BADGE / 2 + 2),
        width - BADGE / 2 - 2,
      );
      const cy = Math.max(edge === "top" ? top : bottom, BADGE / 2 + 2);
      const badge = document.createElement("div");
      badge.textContent = label;
      badge.style.cssText = [
        "position:absolute",
        `left:${cx - BADGE / 2}px`,
        `top:${cy - BADGE / 2}px`,
        `width:${BADGE}px`,
        `height:${BADGE}px`,
        "border-radius:50%",
        `background:${COLOR}`,
        "color:#fff",
        "border:2px solid #fff",
        "box-sizing:border-box",
        "box-shadow:0 1px 4px rgb(0 0 0 / 0.35)",
        "display:grid",
        "place-items:center",
        "font:700 13px/1 var(--font-sans, system-ui), system-ui, sans-serif",
      ].join(";");
      overlay.append(badge);
    }
    document.body.append(overlay);
  }, items);
}

async function takeShot(page: Page, name: string, shot: Shot, locale: Locale) {
  const m = MESSAGES[locale];
  const digits = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : "en-US");
  await page.setViewportSize(shot.viewport ?? DESKTOP);
  await page.goto(
    `${STORYBOOK_URL}/iframe.html?id=${typeof shot.story === "string" ? shot.story : shot.story[locale]}&viewMode=story&globals=${GLOBALS[locale]}`,
    { waitUntil: "networkidle", timeout: 120_000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);

  const items = [];
  for (const [index, callout] of shot.callouts.entries()) {
    try {
      const box = await outlineBox(
        locate(page, callout.target, m),
        callout.around,
      );
      items.push({
        box,
        label: digits.format(index + 1),
        corner: callout.corner ?? "top-start",
      });
    } catch (error) {
      throw new Error(
        `${name} (${locale}): callout ${index + 1} not found: ${(error as Error).message.split("\n")[0]}`,
      );
    }
  }
  await drawCallouts(page, items);

  const file = path.join(OUT_DIR, locale, `${name}.png`);
  await mkdir(path.dirname(file), { recursive: true });
  await page.screenshot({
    path: file,
    fullPage: shot.fullPage ?? false,
    animations: "disabled",
    caret: "hide",
  });
  console.log(`  ${path.relative(process.cwd(), file)}`);
}

async function main() {
  const wanted = process.argv.slice(2);
  const unknown = wanted.filter((name) => !(name in SHOTS));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown shot: ${unknown.join(", ")}. Shots: ${Object.keys(SHOTS).join(", ")}`,
    );
  }
  const names = wanted.length > 0 ? wanted : Object.keys(SHOTS);

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  try {
    for (const name of names) {
      for (const locale of LOCALES) {
        await takeShot(page, name, SHOTS[name], locale);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
