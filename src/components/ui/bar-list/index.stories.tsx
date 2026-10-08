import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BanknoteIcon, CreditCardIcon } from "lucide-react";

import { CategoryChip } from "@/components/ui/category-chip";

import { type BarListItem, BarList } from "./index";

const CATEGORIES: BarListItem[] = [
  {
    id: "home",
    name: "خانه",
    label: <CategoryChip name="خانه" color="brown" />,
    value: 22100000,
    color: "brown",
    items: [
      { id: "rent", name: "اجاره", value: 18000000 },
      { id: "bills", name: "قبوض", value: 1700000 },
      { id: "repairs", name: "تعمیرات", value: 2400000 },
    ],
  },
  {
    id: "food",
    name: "خوراک",
    label: <CategoryChip name="خوراک" color="orange" />,
    value: 6240000,
    color: "orange",
    items: [
      { id: "grocery", name: "سوپرمارکت", value: 3420000 },
      { id: "cafe", name: "رستوران و کافه", value: 1910000 },
      { id: "fruit", name: "میوه و تره‌بار", value: 910000 },
    ],
  },
  {
    id: "transport",
    name: "حمل‌ونقل",
    label: <CategoryChip name="حمل‌ونقل" color="sky" />,
    value: 2720000,
    color: "sky",
    items: [
      { id: "taxi", name: "تاکسی اینترنتی", value: 1380000 },
      { id: "fuel", name: "سوخت", value: 1040000 },
      { id: "metro", name: "مترو و اتوبوس", value: 300000 },
    ],
  },
  {
    id: "subscriptions",
    name: "اشتراک‌ها",
    label: <CategoryChip name="اشتراک‌ها" color="violet" />,
    value: 1700000,
    color: "violet",
  },
  {
    id: "health",
    name: "سلامت",
    label: <CategoryChip name="سلامت" color="red" />,
    value: 690000,
    color: "red",
  },
];

const meta = {
  title: "Design system/BarList",
  component: BarList,
  args: { items: CATEGORIES, "aria-label": "هزینه به تفکیک دسته" },
  argTypes: { items: { control: false } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 520 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BarList>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Categories, most first, each bar in its hue. Tap one to see its subcategories. */
export const Categories: Story = {};

/** A category open: each subcategory with its share of the category. */
export const Expanded: Story = { args: { defaultExpanded: ["food"] } };

/** Without hues: brand bars with a tile, such as spending by account. */
export const Accounts: Story = {
  args: {
    items: [
      {
        id: "melli",
        name: "بانک ملی",
        value: 23500000,
        icon: CreditCardIcon,
      },
      {
        id: "saman",
        name: "بانک سامان",
        value: 7880000,
        icon: CreditCardIcon,
      },
      {
        id: "cash",
        name: "کیف پول نقدی",
        value: 2070000,
        icon: BanknoteIcon,
      },
    ],
    "aria-label": "هزینه به تفکیک حساب",
  },
};

/** One item takes the whole bar. */
export const Single: Story = { args: { items: CATEGORIES.slice(3, 4) } };
