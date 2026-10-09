import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { UpdateCheck } from "@/types/release";

import { AboutSettings } from "./index";

const RELEASES = "https://github.com/mrghasemi1992/money/releases";

const meta = {
  title: "Components/AboutSettings",
  component: AboutSettings,
  args: {
    version: { version: "0.2.0", commit: "77b0954" },
  },
} satisfies Meta<typeof AboutSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Editors and viewers: the version and commit, no update check. */
export const Default: Story = {};

/** An admin on the latest release. */
export const UpToDate: Story = {
  args: {
    updateCheck: Promise.resolve<UpdateCheck>({
      latest: "0.2.0",
      url: RELEASES,
      available: false,
    }),
  },
};

/** An admin whose copy is behind the latest release. */
export const UpdateAvailable: Story = {
  args: {
    updateCheck: Promise.resolve<UpdateCheck>({
      latest: "0.3.0",
      url: RELEASES,
      available: true,
    }),
  },
};

/** GitHub couldn't tell (no release yet, offline, rate limited): nothing is shown. */
export const CheckFailed: Story = {
  args: { updateCheck: Promise.resolve(null) },
};

/** Locally, outside Vercel, there is no commit. */
export const Local: Story = {
  args: { version: { version: "0.2.0", commit: null } },
};

export const Mobile: Story = {
  args: {
    updateCheck: Promise.resolve<UpdateCheck>({
      latest: "0.3.0",
      url: RELEASES,
      available: true,
    }),
  },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
