import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";

import { DisplaySettings } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

/**
 * The language, calendar and money toolbars set what this section shows as saved. In the app,
 * a choice saves and the page re-renders with it; here the toolbar value comes back after the
 * fake save. The theme choice is real: it changes this story's theme.
 */
const meta = {
  title: "Components/DisplaySettings",
  component: DisplaySettings,
  args: {
    onChangeLocale: wait,
    onSavePreferences: async (): Promise<ActionResult> => {
      await wait();
      return { ok: true };
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "var(--settings-max)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DisplaySettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An IRR book: rial or toman is offered. */
export const RialBook: Story = {};

/** Other currencies have no rial/toman row. */
export const DollarBook: Story = { globals: { money: "USD" } };

export const SaveFails: Story = {
  args: {
    onSavePreferences: async (): Promise<ActionResult> => {
      await wait();
      return {
        ok: false,
        error: "ذخیره نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
      };
    },
  },
};
