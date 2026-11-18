import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { REPORT_SECTION_PATHS } from "@/constants/report";
import { SMALL_PHONE_GLOBALS } from "@/constants/worst-case";

import { ReportTabs } from "./index";

const meta = {
  title: "Components/ReportTabs",
  component: ReportTabs,
  args: { section: "overview" },
  parameters: {
    layout: "padded",
    nextjs: {
      navigation: { pathname: "/reports", query: { month: "1405-08" } },
    },
  },
} satisfies Meta<typeof ReportTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The overview; the links keep the period («?month=1405-08»). */
export const Overview: Story = {};

export const Breakdown: Story = {
  args: { section: "breakdown" },
  parameters: {
    nextjs: { navigation: { pathname: REPORT_SECTION_PATHS.breakdown } },
  },
};

export const OverTime: Story = {
  args: { section: "trends" },
  parameters: {
    nextjs: { navigation: { pathname: REPORT_SECTION_PATHS.trends } },
  },
};

/** A 320px phone: the labels without their icons, so «Breakdown» and «Over time» fit (check English). */
export const SmallPhone: Story = { globals: SMALL_PHONE_GLOBALS };
