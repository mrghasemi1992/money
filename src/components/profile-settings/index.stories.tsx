import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";

import { ProfileSettings } from "./index";

/** Waits like a Server Action, so the button shows its loading state. */
const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

const meta = {
  title: "Components/ProfileSettings",
  component: ProfileSettings,
  args: {
    name: "مریم احمدی",
    username: "maryam.ahmadi",
    onSave: async (): Promise<ActionResult> => {
      await wait();
      return { ok: true };
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "var(--settings-max)" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Clear the name and save to see the error; save a name to see the toast. */
export const Default: Story = {};

/** The server refused the name (its errors come back translated). */
export const ServerError: Story = {
  args: {
    onSave: async (): Promise<ActionResult> => {
      await wait();
      return { ok: false, error: "نام نمایشی را وارد کنید." };
    },
  },
};
