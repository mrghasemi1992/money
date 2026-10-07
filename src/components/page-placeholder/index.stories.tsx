import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PagePlaceholder } from "./index";

const meta = {
  title: "Components/PagePlaceholder",
  component: PagePlaceholder,
  args: { section: "dashboard" },
  argTypes: {
    section: {
      control: "inline-radio",
      options: ["dashboard", "budgets", "reports"],
    },
  },
} satisfies Meta<typeof PagePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {};

export const Budgets: Story = { args: { section: "budgets" } };
