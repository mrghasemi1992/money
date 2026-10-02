import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { JalaliDate } from "./index";

const TODAY = "2026-10-01";

const meta = {
  title: "Design system/JalaliDate",
  component: JalaliDate,
  args: {
    value: TODAY,
    today: TODAY,
    format: "long",
    relative: false,
    muted: false,
  },
  argTypes: {
    format: {
      control: "inline-radio",
      options: ["long", "weekday", "short", "month", "numeric"],
    },
  },
} satisfies Meta<typeof JalaliDate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Formats: Story = {
  render: () => (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "var(--space-2) var(--space-6)",
        margin: 0,
      }}
    >
      {(["long", "weekday", "short", "month", "numeric"] as const).map(
        (format) => (
          <div key={format} style={{ display: "contents" }}>
            <dt className="type-caption">{format}</dt>
            <dd style={{ margin: 0 }}>
              <JalaliDate value={TODAY} format={format} />
            </dd>
          </div>
        ),
      )}
    </dl>
  ),
};

/** In lists, the last two days read «امروز» and «دیروز». */
export const Relative: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-2)" }}>
      <JalaliDate value="2026-10-01" today={TODAY} relative />
      <JalaliDate value="2026-09-30" today={TODAY} relative />
      <JalaliDate value="2026-09-29" today={TODAY} relative muted />
    </div>
  ),
};
