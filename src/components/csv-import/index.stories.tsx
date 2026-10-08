import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { ImportPayload } from "@/helpers/csv-import";
import type { ActionResult } from "@/types/action";
import type { ImportResult } from "@/types/csv";

import { CsvImport } from "./index";
import {
  SAMPLE_IMPORT_BOOK,
  SAMPLE_IMPORT_FILE_EN,
  SAMPLE_IMPORT_FILE_FA,
  sampleCheckDuplicates,
} from "./sample-import";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 800));

/** A fake save: everything ready is added, chosen duplicates included. */
async function save(
  payload: ImportPayload,
): Promise<ActionResult<never, { result: ImportResult }>> {
  await wait();
  return {
    ok: true,
    result: {
      added: payload.records.length - 5,
      skipped: 2 - payload.addDuplicates.length,
      failed: 5,
      created: { accounts: 0, categories: 1, subcategories: 0 },
    },
  };
}

const meta = {
  title: "Components/CsvImport",
  component: CsvImport,
  args: {
    book: SAMPLE_IMPORT_BOOK,
    onCheckDuplicates: sampleCheckDuplicates,
    onImport: save,
  },
  argTypes: {
    book: { control: false },
    initialFile: { control: false },
  },
  parameters: { layout: "padded" },
} satisfies Meta<typeof CsvImport>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The first step: choose or drop a CSV file (the sample file works too). */
export const Upload: Story = {};

/**
 * A Persian bank file already read. «بعدی» walks through the steps with working fakes: columns,
 * names, review (two rows look like stored ones) and the result.
 */
export const FileRead: Story = { args: { initialFile: SAMPLE_IMPORT_FILE_FA } };

export const MapColumns: Story = {
  args: { initialFile: SAMPLE_IMPORT_FILE_FA, initialStep: "map" },
};

export const MatchNames: Story = {
  args: {
    initialFile: SAMPLE_IMPORT_FILE_FA,
    initialStep: "match",
    initialRialUnit: "toman",
  },
};

export const Review: Story = {
  args: {
    initialFile: SAMPLE_IMPORT_FILE_FA,
    initialStep: "review",
    initialRialUnit: "toman",
  },
};

/** An English file with signed amounts and one Jalali date. */
export const SignedAmounts: Story = {
  args: { initialFile: SAMPLE_IMPORT_FILE_EN, initialStep: "map" },
};

export const Mobile: Story = {
  args: { initialFile: SAMPLE_IMPORT_FILE_FA, initialStep: "map" },
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
