import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProgressBar } from "./index";

const meta = {
  title: "Design system/ProgressBar",
  component: ProgressBar,
  args: {
    label: "خوراک",
    value: 6200000,
    max: 12000000,
    showValues: true,
    size: "md",
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** ok, near the limit (from 80%) and over. Over is striped, so it doesn't rely on red. */
export const Statuses: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-6)" }}>
      <ProgressBar label="خوراک" value={6200000} max={12000000} showValues />
      <ProgressBar label="حمل و نقل" value={4300000} max={5000000} showValues />
      <ProgressBar label="تفریح" value={3650000} max={3000000} showValues />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-4)" }}>
      <ProgressBar value={40} max={100} size="sm" aria-label="کوچک" />
      <ProgressBar value={40} max={100} aria-label="متوسط" />
      <ProgressBar value={40} max={100} size="lg" aria-label="بزرگ" />
    </div>
  ),
};

/** A marker across the track, explained in the footer: how far into the month today is. */
export const Marker: Story = {
  args: {
    label: undefined,
    value: 310000000,
    max: 379000000,
    size: "lg",
    showValues: false,
    caption: "۸۲٪ از کل بودجه خرج شده",
    marker: 16 / 30,
    markerLabel: "امروز، ۵۳٪ از ماه گذشته",
  },
};
