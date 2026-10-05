import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";
import type { PasswordField } from "@/types/user";

import { PasswordSettings } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

const meta = {
  title: "Components/PasswordSettings",
  component: PasswordSettings,
  args: {
    username: "maryam.ahmadi",
    onChange: async (): Promise<ActionResult<PasswordField>> => {
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
} satisfies Meta<typeof PasswordSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Submit empty, with a short new password or a mismatched repeat to see each error. */
export const Default: Story = {};

/** The server says the current password is wrong: the error goes on that field. */
export const WrongCurrentPassword: Story = {
  args: {
    onChange: async (): Promise<ActionResult<PasswordField>> => {
      await wait();
      return { ok: false, field: "current", error: "رمز فعلی درست نیست." };
    },
  },
};
