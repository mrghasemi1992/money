import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import {
  NavigationProgress,
  useNavigationPending,
  useReportNavigation,
} from "./index";

const meta = {
  title: "Components/NavigationProgress",
  component: NavigationProgress,
} satisfies Meta<typeof NavigationProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo() {
  const [running, setRunning] = useState(false);
  useReportNavigation(running);
  const pending = useNavigationPending();
  return (
    <div style={{ padding: "var(--space-6)" }}>
      <NavigationProgress />
      <Button onClick={() => setRunning((value) => !value)}>
        {pending ? "Finish navigation" : "Start navigation"}
      </Button>
    </div>
  );
}

/** The bar shows after 150 ms, creeps toward the end and finishes with the page. */
export const Default: Story = {
  render: () => <Demo />,
};
