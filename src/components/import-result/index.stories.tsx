import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ImportResult } from "./index";

const meta = {
  title: "Components/ImportResult",
  component: ImportResult,
  args: {
    result: {
      added: 121,
      skipped: 3,
      failed: 4,
      created: { accounts: 1, categories: 1, subcategories: 1 },
    },
    transactionsHref: "/transactions?from=2026-08-24&to=2026-09-14",
    onDownloadFailed: () => {},
    onRestart: () => {},
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImportResult>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Added, skipped and failed rows, and what was created. */
export const Default: Story = {};

/** Nothing failed and nothing new was created: no failed rows to download. */
export const Clean: Story = {
  args: {
    result: {
      added: 48,
      skipped: 0,
      failed: 0,
      created: { accounts: 0, categories: 0, subcategories: 0 },
    },
    onDownloadFailed: undefined,
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
