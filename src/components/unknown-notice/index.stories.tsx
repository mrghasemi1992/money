import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { unknownTransactionsHref } from "@/helpers/dashboard";

import { UnknownNotice } from "./index";

const meta = {
  title: "Components/UnknownNotice",
  component: UnknownNotice,
  args: { count: 3, href: unknownTransactionsHref("2026-09-02") },
  parameters: { layout: "padded" },
} satisfies Meta<typeof UnknownNotice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** One transaction: the English copy is singular. */
export const One: Story = { args: { count: 1 } };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
