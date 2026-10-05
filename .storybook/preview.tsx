import type { Decorator, Preview } from "@storybook/nextjs-vite";

import { Providers } from "../src/components/providers";
import { LOCALE_DIRECTIONS } from "../src/constants/locale";
import { combinePreferences } from "../src/helpers/preferences";
import { MESSAGES } from "../src/messages";
import { fontVariables } from "../src/styles/fonts";
import type { CalendarSystem } from "../src/types/calendar";
import type { Currency, RialUnit } from "../src/types/currency";
import type { Locale } from "../src/types/locale";
import "../src/app/globals.css";

/** Toolbar choice for amounts: the book currency, with rial or toman for IRR. */
const MONEY_OPTIONS: Record<
  string,
  { currency: Currency; rialUnit: RialUnit }
> = {
  rial: { currency: "IRR", rialUnit: "rial" },
  toman: { currency: "IRR", rialUnit: "toman" },
  USD: { currency: "USD", rialUnit: "rial" },
  EUR: { currency: "EUR", rialUnit: "rial" },
  GBP: { currency: "GBP", rialUnit: "rial" },
};

/**
 * Apply the language, direction, fonts and toolbar theme to <html>, the same place the app
 * puts them, and wrap every story in the app's Providers with the toolbar's language,
 * calendar and money unit.
 */
const withAppShell: Decorator = (Story, context) => {
  const locale: Locale = context.globals.locale === "en" ? "en" : "fa";
  const calendar: CalendarSystem =
    context.globals.calendar === "gregorian" ? "gregorian" : "jalali";
  const money = MONEY_OPTIONS[context.globals.money] ?? MONEY_OPTIONS.rial;

  const root = document.documentElement;
  root.lang = locale;
  root.dir = LOCALE_DIRECTIONS[locale];
  root.classList.add(...fontVariables.split(" "));
  root.setAttribute(
    "data-theme",
    context.globals.theme === "dark" ? "dark" : "light",
  );

  const preferences = combinePreferences(
    { locale, calendar, rialUnit: money.rialUnit },
    { currency: money.currency },
    "Asia/Tehran",
  );
  return (
    <Providers preferences={preferences} messages={MESSAGES[locale]}>
      <Story />
    </Providers>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
    locale: {
      description: "Interface language and direction",
      toolbar: {
        title: "Language",
        icon: "globe",
        items: [
          { value: "fa", title: "فارسی (RTL)" },
          { value: "en", title: "English (LTR)" },
        ],
        dynamicTitle: true,
      },
    },
    calendar: {
      description: "Calendar for dates",
      toolbar: {
        title: "Calendar",
        icon: "calendar",
        items: [
          { value: "jalali", title: "Jalali" },
          { value: "gregorian", title: "Gregorian" },
        ],
        dynamicTitle: true,
      },
    },
    money: {
      description: "Book currency (rial or toman for IRR)",
      toolbar: {
        title: "Money",
        icon: "credit",
        items: [
          { value: "rial", title: "IRR · rial" },
          { value: "toman", title: "IRR · toman" },
          { value: "USD", title: "USD" },
          { value: "EUR", title: "EUR" },
          { value: "GBP", title: "GBP" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    locale: "fa",
    calendar: "jalali",
    money: "rial",
  },
  decorators: [withAppShell],
  parameters: {
    layout: "padded",
    // App Router mocks for next/navigation.
    nextjs: { appDirectory: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
