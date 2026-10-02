import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Amount } from "./index";

const meta = {
  title: "Design system/Amount",
  component: Amount,
  args: {
    value: 850000,
    type: "expense",
    size: "md",
    showSign: true,
    showUnit: true,
    label: false,
    icon: false,
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["income", "expense", "transfer", "neutral"],
    },
    size: { control: "inline-radio", options: ["sm", "md", "lg", "hero"] },
  },
} satisfies Meta<typeof Amount>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Income +, expense −, transfer no sign. The sign, the icon and the word all say the direction. */
export const Directions: Story = {
  render: () => (
    <div
      style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}
    >
      <Amount value={45000000} type="income" icon label />
      <Amount value={850000} type="expense" icon label />
      <Amount value={5000000} type="transfer" icon label />
      <Amount value={-1200000} />
      <Amount value={128450000} />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{ display: "grid", gap: "var(--space-3)", justifyItems: "start" }}
    >
      <Amount value={850000} type="expense" size="sm" />
      <Amount value={850000} type="expense" size="md" />
      <Amount value={850000} type="expense" size="lg" />
      <Amount value={128450000} size="hero" />
    </div>
  ),
};

/** Tabular digits keep a column of amounts aligned. */
export const Column: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        justifyItems: "end",
        width: "max-content",
        gap: "var(--space-1)",
      }}
    >
      {[1111111, 850000, 45000000, 9999, 120000].map((value, index) => (
        <Amount
          key={index}
          value={value}
          type={index % 2 ? "expense" : "income"}
        />
      ))}
    </div>
  ),
};
