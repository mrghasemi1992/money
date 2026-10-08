import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { IMPORT_STEPS } from "@/constants/csv";

import { ImportStepper } from "./index";

const meta = {
  title: "Components/ImportStepper",
  component: ImportStepper,
  args: { step: "match" },
  argTypes: {
    step: { control: "inline-radio", options: [...IMPORT_STEPS] },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImportStepper>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The third step: the first two done, the current one bold. */
export const Default: Story = {};

export const FirstStep: Story = { args: { step: "upload" } };

export const Result: Story = { args: { step: "result" } };

/** On phones: the step's name, «مرحله ۳ از ۵» and five bars. */
export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
