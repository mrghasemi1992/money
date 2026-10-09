import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ActionResult } from "@/types/action";
import type { UpdateCheck } from "@/types/release";

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
    version: { version: "0.2.0", commit: "77b0954" },
    updateCheck: Promise.resolve<UpdateCheck>({
      latest: "0.2.0",
      url: "https://github.com/mrghasemi1992/money/releases",
      available: false,
    }),
  },
} satisfies Meta<typeof Settings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Admins also see the book settings. */
export const Admin: Story = {};

export const AdminNewBook: Story = { args: { currencyLocked: false } };

/** A newer release is out: admins see the notice under the version. */
export const AdminUpdateAvailable: Story = {
  args: {
    updateCheck: Promise.resolve<UpdateCheck>({
      latest: "0.3.0",
      url: "https://github.com/mrghasemi1992/money/releases",
      available: true,
    }),
  },
};

/** Editors and viewers: profile, password, display and the version, without the update check. */
export const Viewer: Story = {
  args: {
    user: { name: "سارا محمدی", username: "sara.mohammadi" },
    isAdmin: false,
    updateCheck: undefined,
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
