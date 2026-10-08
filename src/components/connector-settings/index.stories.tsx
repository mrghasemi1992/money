import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { ActionResult } from "@/types/action";

import {
  type ConnectedApp,
  ConnectorSettings,
  ConnectorSettingsError,
  ConnectorSettingsSkeleton,
} from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 400));

const APPS: ConnectedApp[] = [
  {
    clientId: "https://claude.ai/oauth/mcp-client-metadata",
    name: "Claude",
    connectedOn: "2026-08-24",
    lastUsedOn: "2026-10-08",
  },
  {
    clientId: "https://claude.ai/oauth/claude-code-client-metadata",
    name: "Claude Code",
    connectedOn: "2026-09-12",
    lastUsedOn: null,
  },
];

const meta = {
  title: "Components/ConnectorSettings",
  component: ConnectorSettings,
  args: {
    url: "https://money.example.com/mcp",
    role: "editor",
    apps: APPS,
    onRevoke: async (): Promise<ActionResult> => {
      await wait();
      return { ok: true };
    },
  },
  argTypes: { apps: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ConnectorSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Revoking removes the app here, as the page's refresh would. */
export const Default: Story = {
  render: function Example(args) {
    const [apps, setApps] = useState(args.apps);
    return (
      <ConnectorSettings
        {...args}
        apps={apps}
        onRevoke={async ({ clientId }) => {
          await wait();
          setApps((current) =>
            current.filter((app) => app.clientId !== clientId),
          );
          return { ok: true };
        }}
      />
    );
  },
};

/** Viewers connect too; Claude can only read for them. */
export const Viewer: Story = { args: { role: "viewer" } };

export const NoApps: Story = { args: { apps: [] } };

export const RevokeFails: Story = {
  args: {
    onRevoke: async () => {
      await wait();
      return {
        ok: false,
        error:
          "دسترسی قطع نشد. اتصال اینترنت را بررسی کنید و دوباره تلاش کنید.",
      };
    },
  },
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};

/** loading.tsx */
export const Loading: Story = {
  render: () => <ConnectorSettingsSkeleton />,
};

/** error.tsx */
export const LoadFailed: Story = {
  render: () => <ConnectorSettingsError onRetry={() => {}} />,
};
