import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SIGN_IN_LIMIT } from "@/constants/auth";

import { Login } from "./index";

const meta = {
  title: "Components/Login",
  component: Login,
  // The language switch calls a Server Action in the app; here it does nothing.
  args: { returnTo: "/", onChangeLocale: async () => {} },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

const filled = { username: "sara.ahmadi", password: "pool-1405-sara" };

export const Empty: Story = {};

export const Filled: Story = { args: { initialState: filled } };

export const Loading: Story = {
  args: { initialState: { ...filled, busy: true } },
};

/** One general message: it never says whether the username or the password was wrong. */
export const WrongCredentials: Story = {
  args: { initialState: { username: "sara.ahmadi", alert: "wrong" } },
};

export const AccountDisabled: Story = {
  args: { initialState: { username: "reza.karimi", alert: "disabled" } },
};

/** After too many attempts the button waits for the countdown. */
export const TooManyAttempts: Story = {
  args: {
    initialState: {
      username: "sara.ahmadi",
      alert: "locked",
      lockSeconds: SIGN_IN_LIMIT.windowSeconds - 1,
    },
  },
};

export const ConnectionFailed: Story = {
  args: { initialState: { ...filled, alert: "failed" } },
};

/** Phone layout: the whole screen, the note at the bottom. */
export const Mobile: Story = {
  args: { initialState: filled },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** Signing in for Claude's connector: which app asks, and the button continues to consent. */
export const ForClaude: Story = {
  args: { oauth: { query: "sig=story", clientName: "Claude" } },
};
