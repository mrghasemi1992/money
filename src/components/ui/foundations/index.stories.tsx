import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  CategoryColors,
  MotionAndIcons,
  Numerals,
  Palette,
  SemanticColors,
  SpacingRadiusShadow,
  TypeScale,
} from "./index";

const meta = {
  title: "Design system/Foundations",
  parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Switch the theme in the toolbar: every value is read from the live tokens. */
export const Colors: Story = { render: () => <SemanticColors /> };

export const Categories: Story = { render: () => <CategoryColors /> };

export const PaletteRamps: Story = {
  name: "Palette",
  render: () => <Palette />,
};

export const Typography: Story = { render: () => <TypeScale /> };

export const PersianNumerals: Story = {
  name: "Numerals",
  render: () => <Numerals />,
};

export const SpacingRadiusShadows: Story = {
  name: "Spacing, radius, shadow",
  render: () => <SpacingRadiusShadow />,
};

export const MotionIcons: Story = {
  name: "Motion and icons",
  render: () => <MotionAndIcons />,
};
