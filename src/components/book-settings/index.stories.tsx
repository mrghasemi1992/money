import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";

import { BookSettings } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

const meta = {
  title: "Components/BookSettings",
  component: BookSettings,
  args: {
    locked: false,
    onSaveCurrency: async (): Promise<ActionResult> => {
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
} satisfies Meta<typeof BookSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing recorded yet: the currency can still change. */
export const Open: Story = {};

/** The book holds amounts: the currency is fixed, with the reason. */
export const Locked: Story = { args: { locked: true } };

/** Someone recorded an amount after the page loaded: the server refuses. */
export const RefusedByServer: Story = {
  args: {
    onSaveCurrency: async (): Promise<ActionResult> => {
      await wait();
      return {
        ok: false,
        error:
          "پس از ثبت اولین مبلغ (تراکنش، بودجه یا موجودی اولیه)، واحد پول دفتر قابل تغییر نیست.",
      };
    },
  },
};
