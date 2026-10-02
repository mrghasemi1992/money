import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PencilIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";

import { Tooltip } from "./index";

const meta = {
  title: "Design system/Tooltip",
  component: Tooltip,
  args: {
    content: "ویرایش تراکنش",
    side: "top",
    children: <Button variant="secondary">نگه دارید یا فوکوس کنید</Button>,
  },
  argTypes: {
    side: {
      control: "inline-radio",
      options: ["top", "bottom", "inline-start", "inline-end"],
    },
    children: { control: false },
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Open: Story = { args: { open: true } };

/** Icon buttons get their tooltip from the label automatically. */
export const OnIconButton: Story = {
  render: () => (
    <IconButton icon={PencilIcon} label="ویرایش تراکنش" variant="secondary" />
  ),
};

/** inline-start sits on the right in RTL. */
export const Sides: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: "var(--space-12)",
        padding: "var(--space-12)",
      }}
    >
      {(["top", "bottom", "inline-start", "inline-end"] as const).map(
        (side) => (
          <Tooltip key={side} content={side} side={side} open>
            <Button variant="secondary" size="sm">
              {side}
            </Button>
          </Tooltip>
        ),
      )}
    </div>
  ),
};
