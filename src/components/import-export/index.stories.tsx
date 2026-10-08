import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import {
  SAMPLE_IMPORT_BOOK,
  sampleCheckDuplicates,
} from "@/components/csv-import/sample-import";

import { ImportExport, ImportExportError, ImportExportSkeleton } from "./index";

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

const meta = {
  title: "Components/ImportExport",
  component: ImportExport,
  args: {
    book: SAMPLE_IMPORT_BOOK,
    canWrite: true,
    onCount: async () => {
      await wait();
      return 46;
    },
    onCheckDuplicates: sampleCheckDuplicates,
    onImport: async () => {
      await wait();
      return {
        ok: true,
        result: {
          added: 8,
          skipped: 0,
          failed: 5,
          created: { accounts: 0, categories: 1, subcategories: 0 },
        },
      };
    },
    onDownload: () => {},
  },
  argTypes: { book: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImportExport>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An editor or admin: export, then the import's first step. */
export const Default: Story = {};

/** A viewer: export only, and a note that import is for editors and admins. */
export const Viewer: Story = { args: { canWrite: false } };

export const Loading: Story = { render: () => <ImportExportSkeleton /> };

export const Error: Story = {
  render: () => <ImportExportError onRetry={() => {}} />,
};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
