import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SAMPLE_ACCOUNT_REPORT } from "@/components/reports/sample-reports";

import { AccountReport } from "./index";

const meta = {
  title: "Components/AccountReport",
  component: AccountReport,
  args: { rows: SAMPLE_ACCOUNT_REPORT },
  argTypes: { rows: { control: false } },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountReport>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What was spent from each account, most first. */
export const Accounts: Story = {};

/** Only income in the period: nothing spent from any account. */
export const Empty: Story = { args: { rows: [] } };
