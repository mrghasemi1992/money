import type { Decorator, Preview } from "@storybook/nextjs-vite";

import { Providers } from "../src/components/providers";
import { fontVariables } from "../src/styles/fonts";
import "../src/app/globals.css";

/**
 * Apply the language, direction (RTL), fonts and toolbar theme to <html>, the same place the
 * app puts them, and wrap every story in the app's Providers.
 */
const withAppShell: Decorator = (Story, context) => {
  const root = document.documentElement;
  root.lang = "fa";
  root.dir = "rtl";
  root.classList.add(...fontVariables.split(" "));
  root.setAttribute(
    "data-theme",
    context.globals.theme === "dark" ? "dark" : "light",
  );
  return (
    <Providers>
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
  },
  initialGlobals: {
    theme: "light",
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
