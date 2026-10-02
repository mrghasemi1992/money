import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  BriefcaseIcon,
  CarIcon,
  HeartPulseIcon,
  HouseIcon,
  LaptopIcon,
  UtensilsIcon,
} from "lucide-react";

import { CATEGORY_COLORS, CATEGORY_COLOR_NAMES } from "@/constants/category";

import { CategoryChip } from "./index";

const meta = {
  title: "Design system/CategoryChip",
  component: CategoryChip,
  args: {
    name: "خوراک",
    sub: "رستوران",
    color: "orange",
    variant: "plain",
    size: "md",
  },
  argTypes: {
    color: { control: "select", options: [...CATEGORY_COLORS] },
    variant: { control: "inline-radio", options: ["plain", "soft"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    icon: { control: false },
  },
} satisfies Meta<typeof CategoryChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Every category hue, plain and soft. Switch the theme to compare. */
export const AllColors: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, max-content)",
        gap: "var(--space-3) var(--space-8)",
      }}
    >
      {CATEGORY_COLORS.map((color) => (
        <div key={color} style={{ display: "contents" }}>
          <CategoryChip name={CATEGORY_COLOR_NAMES[color]} color={color} />
          <CategoryChip
            name={CATEGORY_COLOR_NAMES[color]}
            color={color}
            variant="soft"
          />
        </div>
      ))}
    </div>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <CategoryChip
        name="خوراک"
        sub="خرید خانه"
        color="orange"
        icon={UtensilsIcon}
      />
      <CategoryChip name="حمل و نقل" color="sky" icon={CarIcon} />
      <CategoryChip name="خانه" sub="اجاره" color="teal" icon={HouseIcon} />
      <CategoryChip name="سلامت" color="red" icon={HeartPulseIcon} size="sm" />
      <CategoryChip name="حقوق" color="green" icon={BriefcaseIcon} size="sm" />
      <CategoryChip
        name="پروژه آزاد"
        color="violet"
        icon={LaptopIcon}
        size="sm"
      />
    </div>
  ),
};
