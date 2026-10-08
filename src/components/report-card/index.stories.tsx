import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Amount } from "@/components/ui/amount";
import { BarList } from "@/components/ui/bar-list";
import { DataTable } from "@/components/ui/data-table";

import { ReportCard, ReportCardSkeleton } from "./index";

const ROWS = [
  { id: "melli", name: "بانک ملی", value: 23500000 },
  { id: "saman", name: "بانک سامان", value: 7880000 },
];

const meta = {
  title: "Components/ReportCard",
  component: ReportCard,
  args: {
    title: "هزینه به تفکیک حساب",
    subtitle: "جمع: ۳۱٬۳۸۰٬۰۰۰ ریال",
    chart: <BarList items={ROWS} />,
    table: (
      <DataTable
        caption="هزینه به تفکیک حساب"
        columns={[
          { key: "account", label: "حساب" },
          { key: "amount", label: "مبلغ", align: "end" },
        ]}
        rows={ROWS.map((row) => ({
          key: row.id,
          cells: [row.name, <Amount key="a" value={row.value} size="sm" />],
        }))}
      />
    ),
  },
  argTypes: {
    chart: { control: false },
    table: { control: false },
    extra: { control: false },
  },
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ReportCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A chart, and the switch to a table of the same figures. */
export const Chart: Story = {};

export const Table: Story = { args: { defaultView: "table" } };

/** Nothing to show: a quiet line instead of the chart and the switch. */
export const Empty: Story = {
  args: { empty: "در این دوره هزینه‌ای ثبت نشده." },
};

export const Loading: Story = { render: () => <ReportCardSkeleton /> };
