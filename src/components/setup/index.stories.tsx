import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Setup } from "./index";

const meta = {
  title: "Components/Setup",
  component: Setup,
  // The Server Actions run in the app; here creating fails on a wrong code and otherwise
  // succeeds, and the language switch does nothing.
  args: {
    onCreate: async (input) =>
      input.code.trim() === "story-secret"
        ? { ok: true }
        : { ok: false, field: "code", error: "The setup code is incorrect." },
    onChangeLocale: async () => {},
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Setup>;

export default meta;
type Story = StoryObj<typeof meta>;

const filled = {
  code: "story-secret",
  name: "سارا رحیمی",
  username: "sara",
  password: "pool-1405-sara",
};

/** A new copy: the setup code first, then the admin's account. */
export const Empty: Story = {};

export const Filled: Story = { args: { initialState: filled } };

export const Creating: Story = {
  args: { initialState: { ...filled, busy: true } },
};

/** The code isn't the deployment's BETTER_AUTH_SECRET. */
export const WrongCode: Story = {
  args: {
    initialState: {
      ...filled,
      code: "wrong",
      errors: { code: "کد راه‌اندازی درست نیست." },
    },
  },
};

export const Failed: Story = {
  args: {
    initialState: {
      ...filled,
      alert: {
        tone: "danger",
        text: "حساب ساخته نشد. اتصال اینترنت را بررسی کنید و دوباره امتحان کنید.",
      },
    },
  },
};

/** Phone layout: the whole screen, scrolling. */
export const Mobile: Story = {
  args: { initialState: filled },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
