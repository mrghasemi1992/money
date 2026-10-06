import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";
import type { NewUserField } from "@/types/user";

import { NewUserDialog } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

const PASSWORDS = ["kT7m-Qx4p-Wz9r", "Hn3c-v8Ra-pW2x", "s9Tg-Kd4e-Mb7q"];
let next = 0;

const meta = {
  title: "Components/NewUserDialog",
  component: NewUserDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    onGeneratePassword: async () => {
      await wait();
      next = (next + 1) % PASSWORDS.length;
      return PASSWORDS[next];
    },
    onCreate: async (): Promise<ActionResult<NewUserField>> => {
      await wait();
      return { ok: true };
    },
  },
} satisfies Meta<typeof NewUserDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Submit it empty, or with a short username or password, to see each error. */
export const Default: Story = {};

/** The server says the username is taken: the error goes on that field. */
export const UsernameTaken: Story = {
  args: {
    onCreate: async (): Promise<ActionResult<NewUserField>> => {
      await wait();
      return {
        ok: false,
        field: "username",
        error: "این نام کاربری قبلاً گرفته شده است.",
      };
    },
  },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
