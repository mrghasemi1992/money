"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import { Tooltip } from "@base-ui/react/tooltip";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";

import { ToastProvider } from "@/components/ui/toast";
import { LOCALE_DIRECTIONS } from "@/constants/locale";
import { PreferencesContext } from "@/hooks/use-preferences";
import type { Messages } from "@/messages";
import type { Preferences } from "@/types/preferences";

/** Hover delay shared by all tooltips, in ms. Moving between triggers shows the next one at once. */
const TOOLTIP_DELAY = 400;

type ProvidersProps = {
  /** The viewer's language, calendar and money unit plus the book's currency and time zone. */
  preferences: Preferences;
  /** Interface copy in preferences.locale. */
  messages: Messages;
  children: ReactNode;
};

/**
 * App-wide context: the interface language and copy (next-intl), the viewer's preferences
 * (usePreferences), the reading direction for Base UI's keyboard and positioning behavior,
 * one tooltip delay group, and the toast viewport. Wraps the app in the root layout and every
 * Storybook story.
 */
export function Providers({ preferences, messages, children }: ProvidersProps) {
  return (
    <NextIntlClientProvider
      locale={preferences.locale}
      messages={messages}
      timeZone={preferences.timeZone}
    >
      <PreferencesContext value={preferences}>
        <DirectionProvider direction={LOCALE_DIRECTIONS[preferences.locale]}>
          <Tooltip.Provider delay={TOOLTIP_DELAY}>
            <ToastProvider>{children}</ToastProvider>
          </Tooltip.Provider>
        </DirectionProvider>
      </PreferencesContext>
    </NextIntlClientProvider>
  );
}
