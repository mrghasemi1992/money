import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { samplePlan } from "@/components/csv-import/sample-plan";
import { SAMPLE_IMPORT_BOOK } from "@/components/csv-import/sample-import";
import {
  completeMatches,
  guessAmountMode,
  guessColumnMap,
} from "@/helpers/csv-import";

import { ImportMatching } from "./index";

const sample = samplePlan();

const meta = {
  title: "Components/ImportMatching",
  component: ImportMatching,
  args: {
    names: sample.names,
    matches: sample.matches,
    onMatch: () => {},
    book: SAMPLE_IMPORT_BOOK,
    newTags: sample.plan.tags,
  },
  argTypes: {
    names: { control: false },
    matches: { control: false },
    book: { control: false },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImportMatching>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The sample file's unknown names with suggestions («ملی» → «بانک ملی», «اشتراک» →
 * «اشتراک‌ها») and «هدیه» to create. Choosing another category for «حمل‌ونقل / تاکسی»'s
 * parent brings its subcategory's choices along.
 */
export const Default: Story = {
  render: function Example(args) {
    const [matches, setMatches] = useState(args.matches);
    const mapping = guessColumnMap(sample.file.rows[0] ?? []);
    const completed = completeMatches(
      sample.records,
      { amountMode: guessAmountMode(mapping), rialUnit: "toman" },
      { book: args.book, currency: "IRR", today: "2026-10-08" },
      matches,
    );
    return (
      <ImportMatching
        {...args}
        names={completed.names}
        matches={completed.matches}
        onMatch={(key, value) =>
          setMatches((current) => ({ ...current, [key]: value }))
        }
      />
    );
  },
};

/** Every name of the file is already in the book. */
export const AllKnown: Story = { args: { names: [], newTags: [] } };

export const Mobile: Story = {
  ...Default,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
