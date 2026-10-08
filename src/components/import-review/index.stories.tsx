import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import {
  sampleDuplicates,
  samplePlan,
} from "@/components/csv-import/sample-plan";
import { SAMPLE_IMPORT_BOOK } from "@/components/csv-import/sample-import";

import { ImportReview, type ImportReviewTab } from "./index";

const sample = samplePlan();
const rowText = (line: number) =>
  (sample.file.rows[line - 1] ?? []).map((cell) => cell || "—").join("، ");

const meta = {
  title: "Components/ImportReview",
  component: ImportReview,
  args: {
    plan: sample.plan,
    duplicates: sampleDuplicates(),
    addDuplicates: new Set<number>(),
    onDuplicateChange: () => {},
    onAllDuplicates: () => {},
    tab: "ready",
    onTabChange: () => {},
    book: SAMPLE_IMPORT_BOOK,
    rowText,
    onDownloadErrors: () => {},
  },
  argTypes: {
    plan: { control: false },
    duplicates: { control: false },
    addDuplicates: { control: false },
    book: { control: false },
    tab: {
      control: "inline-radio",
      options: ["ready", "errors", "duplicates"],
    },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImportReview>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The three tiles switch the list; duplicates can be skipped or added. */
export const Default: Story = {
  render: function Example(args) {
    const [tab, setTab] = useState<ImportReviewTab>(args.tab);
    const [add, setAdd] = useState<ReadonlySet<number>>(new Set());
    return (
      <ImportReview
        {...args}
        tab={tab}
        onTabChange={setTab}
        addDuplicates={add}
        onDuplicateChange={(line, value) =>
          setAdd((current) => {
            const next = new Set(current);
            if (value) next.add(line);
            else next.delete(line);
            return next;
          })
        }
        onAllDuplicates={(value) =>
          setAdd(
            value
              ? new Set((args.duplicates ?? []).map((d) => d.line))
              : new Set(),
          )
        }
      />
    );
  },
};

/** The rows with errors: the row number, the reason and the row as written. */
export const Errors: Story = { ...Default, args: { tab: "errors" } };

export const Duplicates: Story = { ...Default, args: { tab: "duplicates" } };

/** While the server looks for duplicates. */
export const Checking: Story = { args: { duplicates: null } };

export const Mobile: Story = {
  ...Default,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
