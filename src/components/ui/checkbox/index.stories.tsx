import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Checkbox } from "./index";

const meta = {
  title: "Design system/Checkbox",
  component: Checkbox,
  args: {
    label: "فقط تراکنش‌های ناشناخته",
    disabled: false,
    invalid: false,
    indeterminate: false,
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithDescription: Story = {
  args: {
    label: "تکرار ماهانه",
    description: "بودجه هر ماه شمسی دوباره شروع می‌شود.",
    defaultChecked: true,
  },
};

/** Unchecked, checked, mixed, invalid, disabled and disabled checked. Hover and Tab are live. */
export const States: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <Checkbox label="انتخاب نشده" />
      <Checkbox label="انتخاب شده" defaultChecked />
      <Checkbox label="بخشی انتخاب شده" indeterminate />
      <Checkbox label="نامعتبر" invalid />
      <Checkbox label="غیرفعال" disabled />
      <Checkbox label="غیرفعال و انتخاب شده" disabled defaultChecked />
    </div>
  ),
};

/** Without a visible label, pass aria-label (table rows). */
export const SelectAll: Story = {
  render: function Example() {
    const [rows, setRows] = useState([true, false, true]);
    const all = rows.every(Boolean);
    const some = rows.some(Boolean) && !all;
    return (
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <Checkbox
          label="همه"
          checked={all}
          indeterminate={some}
          onCheckedChange={(checked) => setRows(rows.map(() => checked))}
        />
        {rows.map((checked, index) => (
          <Checkbox
            key={index}
            aria-label={`ردیف ${index + 1}`}
            checked={checked}
            onCheckedChange={(next) =>
              setRows(rows.map((value, i) => (i === index ? next : value)))
            }
          />
        ))}
      </div>
    );
  },
};
