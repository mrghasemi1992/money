import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ConnectorConsent } from "./index";

const request = {
  query: "client_id=story&sig=story",
  clientName: "Claude",
  redirectHost: "claude.ai",
};

const meta = {
  title: "Components/ConnectorConsent",
  component: ConnectorConsent,
  args: {
    request,
    user: { name: "سارا رضایی", username: "sara", role: "editor" },
  },
  // Allow and deny call Better Auth in the app; in the story they fail and show the error.
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ConnectorConsent>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An editor (or admin): read, add and edit, delete when asked. */
export const Editor: Story = {};

/** A viewer: Claude can only read, and the note says why. */
export const Viewer: Story = {
  args: { user: { name: "نیما", username: "nima", role: "viewer" } },
};

/** Claude Code connects the same way, with its own name. */
export const ClaudeCode: Story = {
  args: {
    request: {
      ...request,
      clientName: "Claude Code",
      redirectHost: "localhost",
    },
  },
};

export const Allowed: Story = { args: { initialStep: "done" } };

export const Denied: Story = { args: { initialStep: "denied" } };

/** The request expired or its signature didn't check out. */
export const Invalid: Story = { args: { request: null } };

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
