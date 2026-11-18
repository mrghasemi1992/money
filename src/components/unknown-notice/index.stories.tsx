import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SMALL_PHONE_GLOBALS } from "@/constants/worst-case";
import { unknownTransactionsHref } from "@/helpers/dashboard";

import { UnknownNotice } from "./index";

const meta = {
  title: "Components/UnknownNotice",
  component: UnknownNotice,
  args: {
    count: 3,
    href: unknownTransactionsHref("2026-09-02"),
    closeKey: "3|2026-09-02 10:00:00+00",
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof UnknownNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One transaction: the English copy is singular. */
export const One: Story = { args: { count: 1 } };

/** On a phone the link's words go under the text, and the close button stays at the top end. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** The narrowest phone with a five-digit count (#131). */
export const PhoneWorstCase: Story = {
  args: { count: 12345 },
  globals: SMALL_PHONE_GLOBALS,
};
