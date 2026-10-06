import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";

import { ResetPasswordDialog } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

const meta = {
  title: "Components/ResetPasswordDialog",
  component: ResetPasswordDialog,
  args: {
    open: true,
    onOpenChange: () => {},
    user: { id: "u3", name: "سارا رحیمی" },
    onReset: async (): Promise<ActionResult<never, { password: string }>> => {
      await wait();
      return { ok: true, password: "kT7m-Qx4p-Wz9r" };
    },
  },
} satisfies Meta<typeof ResetPasswordDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Confirm first; «بازنشانی رمز» then shows the new password once. */
export const Default: Story = {};

/** The server refused: the error shows as a toast and the dialog stays. */
export const Failed: Story = {
  args: {
    onReset: async (): Promise<ActionResult<never, { password: string }>> => {
      await wait();
      return {
        ok: false,
        error: "انجام نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
      };
    },
  },
};

export const Phone: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
