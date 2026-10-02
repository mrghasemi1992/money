import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SearchField } from "./index";

const meta = {
  title: "Design system/SearchField",
  component: SearchField,
  args: {
    placeholder: "جستجو در تراکنش‌ها",
    "aria-label": "جستجو در تراکنش‌ها",
    size: "md",
    disabled: false,
  },
  argTypes: { size: { control: "inline-radio", options: ["sm", "md", "lg"] } },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 360 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** The clear button appears once there's text. */
export const WithText: Story = { args: { defaultValue: "اسنپ" } };

export const Disabled: Story = { args: { disabled: true } };
