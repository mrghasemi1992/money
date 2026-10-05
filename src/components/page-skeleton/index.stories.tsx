import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PageSkeleton } from "./index";

const meta = {
  title: "Components/PageSkeleton",
  component: PageSkeleton,
} satisfies Meta<typeof PageSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
