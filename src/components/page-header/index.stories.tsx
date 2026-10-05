import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  AddTransactionButton,
  AddTransactionProvider,
} from "@/components/add-transaction";
import { DateText } from "@/components/ui/date-text";

import { PageHeader } from "./index";

const meta = {
  title: "Components/PageHeader",
  component: PageHeader,
  args: { title: "داشبورد" },
  argTypes: {
    title: { control: "text" },
    subtitle: { control: false },
    actions: { control: false },
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TitleOnly: Story = { args: { title: "گزارش‌ها" } };

/** The dashboard: today's date in the viewer's calendar, and the add button for editors and admins. */
export const WithDateAndAction: Story = {
  args: {
    subtitle: <DateText value="2026-10-05" format="weekday" />,
    actions: <AddTransactionButton />,
  },
  decorators: [
    (Story) => (
      <AddTransactionProvider enabled>
        <Story />
      </AddTransactionProvider>
    ),
  ],
};

export const WithSubtitle: Story = {
  args: {
    title: "مدیریت کاربران",
    subtitle: "حساب‌ها فقط به دست مدیر ساخته می‌شوند.",
  },
};
