import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_CATEGORY_REPORT,
  SAMPLE_PREVIOUS_EXPENSES,
} from "@/components/reports/sample-reports";
import { categoryMovers } from "@/helpers/report";
import { sample } from "@/helpers/sample";

import { MoversReport } from "./index";

/** The sample period's expense categories against the 6 months before. */
function Example({ empty = false }: { empty?: boolean }) {
  const movers = empty
    ? []
    : categoryMovers(
        sample(SAMPLE_CATEGORY_REPORT).expense,
        sample(SAMPLE_PREVIOUS_EXPENSES),
      );
  return <MoversReport movers={movers} subtitle="" />;
}

const meta = {
  title: "Components/MoversReport",
  component: Example,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Example>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Travel fell the most, then repairs rose; a category new in the period reads «تازه», and
 * the uncategorized expenses count as one row.
 */
export const Movers: Story = {};

/** Nothing changed from the previous period. */
export const Empty: Story = { args: { empty: true } };
