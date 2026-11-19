import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

import { Providers } from "@/components/providers";
import { combinePreferences } from "@/helpers/preferences";
import { MESSAGES } from "@/messages";
import type { CalendarSystem } from "@/types/calendar";
import type { Currency, RialUnit } from "@/types/currency";
import type { Locale } from "@/types/locale";

export type RenderWithAppOptions = Omit<RenderOptions, "wrapper"> & {
  locale?: Locale;
  calendar?: CalendarSystem;
  currency?: Currency;
  rialUnit?: RialUnit;
};

/**
 * Renders a component inside the app's Providers, as the root layout and Storybook do:
 * Persian, Jalali, rials and Tehran time unless the test says otherwise.
 */
export function renderWithApp(
  ui: ReactElement,
  {
    locale = "fa",
    calendar = "jalali",
    currency = "IRR",
    rialUnit = "rial",
    ...options
  }: RenderWithAppOptions = {},
) {
  const preferences = combinePreferences(
    { locale, calendar, rialUnit },
    { currency },
    "Asia/Tehran",
  );
  return render(ui, {
    wrapper: ({ children }) => (
      <Providers preferences={preferences} messages={MESSAGES[locale]}>
        {children}
      </Providers>
    ),
    ...options,
  });
}
