import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { type ColumnChartPoint, ColumnChart, ColumnChartLegend } from "./index";

/** Six Jalali months up to Mehr 1405, which is still running. */
const SIX_MONTHS: ColumnChartPoint[] = [
  {
    key: "1405-02",
    label: "اردیبهشت ۱۴۰۵",
    shortLabel: "اردیبهشت",
    income: 46200000,
    expense: 41800000,
  },
  {
    key: "1405-03",
    label: "خرداد ۱۴۰۵",
    shortLabel: "خرداد",
    income: 54500000,
    expense: 38900000,
  },
  {
    key: "1405-04",
    label: "تیر ۱۴۰۵",
    shortLabel: "تیر",
    income: 45600000,
    expense: 52700000,
  },
  {
    key: "1405-05",
    label: "مرداد ۱۴۰۵",
    shortLabel: "مرداد",
    income: 66100000,
    expense: 40300000,
  },
  {
    key: "1405-06",
    label: "شهریور ۱۴۰۵",
    shortLabel: "شهریور",
    income: 45000000,
    expense: 39600000,
  },
  {
    key: "1405-07",
    label: "مهر ۱۴۰۵، تا امروز",
    shortLabel: "مهر",
    income: 45000000,
    expense: 29100000,
  },
];

const MONTH_NAMES = [
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
];

/** Twelve Gregorian months with a couple of months spent over income. */
const TWELVE_MONTHS: ColumnChartPoint[] = MONTH_NAMES.map((name, index) => ({
  key: String(index),
  label: `${name} ${index < 2 ? 2025 : 2026}`,
  shortLabel: name,
  income: 420000 + ((index * 37) % 9) * 21000,
  expense: 380000 + ((index * 53) % 11) * 26000,
}));

const meta = {
  title: "Design system/ColumnChart",
  component: ColumnChart,
  args: { points: SIX_MONTHS, "aria-label": "درآمد و هزینه هر ماه" },
  argTypes: { points: { control: false } },
  decorators: [
    (Story) => (
      <div style={{ display: "grid", gap: "var(--space-4)", maxWidth: 1000 }}>
        <ColumnChartLegend />
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ColumnChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hover, tap or focus a month to read it above the plot; arrow keys move between months. */
export const SixMonths: Story = {};

/** A month picked on the page: highlighted, and read out first. */
export const Selected: Story = { args: { selectedKey: "1405-04" } };

/** Twelve months, in dollars: the axis is labeled in thousands. */
export const TwelveMonths: Story = {
  args: { points: TWELVE_MONTHS, unit: "USD" },
};

/** A month with more spent than earned: the net line drops below the zero line. */
export const NegativeNet: Story = {
  args: {
    points: SIX_MONTHS.map((point, index) =>
      index === 2 ? { ...point, expense: 78000000 } : point,
    ),
  },
};

/** On a phone: narrower columns, and only every other label once months crowd. */
export const Narrow: Story = {
  args: { points: TWELVE_MONTHS, unit: "USD" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 358 }}>
        <Story />
      </div>
    ),
  ],
};
