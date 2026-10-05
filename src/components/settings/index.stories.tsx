import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";

import { Settings } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));
const saved = async (): Promise<ActionResult> => {
  await wait();
  return { ok: true };
};

const meta = {
  title: "Components/Settings",
  component: Settings,
  args: {
    user: { name: "مریم احمدی", username: "maryam.ahmadi" },
    isAdmin: true,
    currencyLocked: true,
    onSaveProfile: saved,
    onChangePassword: saved,
    onChangeLocale: wait,
    onSavePreferences: saved,
    onSaveCurrency: saved,
  },
} satisfies Meta<typeof Settings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Admins also see the book settings. */
export const Admin: Story = {};

export const AdminNewBook: Story = { args: { currencyLocked: false } };

/** Editors and viewers: profile, password and display only. */
export const Viewer: Story = {
  args: {
    user: { name: "سارا محمدی", username: "sara.mohammadi" },
    isAdmin: false,
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
