import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Amount } from "@/components/ui/amount";
import { Card } from "@/components/ui/card";

import { DataTable } from "./index";

const meta = {
  title: "Design system/DataTable",
  component: DataTable,
  args: {
    caption: "هزینه به تفکیک دسته",
    columns: [
      { key: "category", label: "دسته‌بندی" },
      { key: "amount", label: "مبلغ", align: "end" },
      { key: "share", label: "سهم از کل", align: "end" },
    ],
    rows: [
      {
        key: "food",
        cells: ["خوراک", <Amount key="a" value={6240000} size="sm" />, "۶۳٪"],
      },
      {
        key: "grocery",
        level: 1,
        cells: [
          "سوپرمارکت",
          <Amount key="a" value={3420000} size="sm" />,
          "۳۵٪",
        ],
      },
      {
        key: "cafe",
        level: 1,
        cells: [
          "رستوران و کافه",
          <Amount key="a" value={1910000} size="sm" />,
          "۱۹٪",
        ],
      },
      {
        key: "transport",
        cells: [
          "حمل‌ونقل",
          <Amount key="a" value={2720000} size="sm" />,
          "۲۸٪",
        ],
      },
      {
        key: "health",
        cells: ["سلامت", <Amount key="a" value={890000} size="sm" />, "۹٪"],
      },
    ],
  },
  argTypes: { columns: { control: false }, rows: { control: false } },
  decorators: [
    (Story) => (
      <Card style={{ maxWidth: 520 }}>
        <Story />
      </Card>
    ),
  ],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A chart's table view: categories with their subcategories indented below them. */
export const Categories: Story = {};

/** Too wide for its card: the table scrolls sideways in its own region. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 260 }}>
        <Story />
      </div>
    ),
  ],
};
