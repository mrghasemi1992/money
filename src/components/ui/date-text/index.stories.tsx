import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DateText } from "./index";

const TODAY = "2026-10-01";
const FORMATS = ["long", "weekday", "short", "month", "numeric"] as const;

const meta = {
  title: "Design system/DateText",
  component: DateText,
  args: {
    value: TODAY,
    today: TODAY,
    format: "long",
    relative: false,
    muted: false,
  },
  argTypes: {
    format: { control: "inline-radio", options: FORMATS },
    calendar: { control: "inline-radio", options: ["jalali", "gregorian"] },
  },
} satisfies Meta<typeof DateText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Every format in both calendars. The language follows the toolbar. */
export const Formats: Story = {
  render: () => (
    <table style={{ borderSpacing: "var(--space-6) var(--space-2)" }}>
      <thead className="type-caption">
        <tr>
          <th />
          <th>jalali</th>
          <th>gregorian</th>
        </tr>
      </thead>
      <tbody>
        {FORMATS.map((format) => (
          <tr key={format}>
            <td className="type-caption">{format}</td>
            <td>
              <DateText value={TODAY} format={format} calendar="jalali" />
            </td>
            <td>
              <DateText value={TODAY} format={format} calendar="gregorian" />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};

/** In lists, the last two days read «امروز» and «دیروز» (Today, Yesterday). */
export const Relative: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-2)" }}>
      <DateText value="2026-10-01" today={TODAY} relative />
      <DateText value="2026-09-30" today={TODAY} relative />
      <DateText value="2026-09-29" today={TODAY} relative muted />
    </div>
  ),
};
