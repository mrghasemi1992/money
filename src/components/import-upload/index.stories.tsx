import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SAMPLE_IMPORT_FILE_FA } from "@/components/csv-import/sample-import";

import { ImportUpload } from "./index";

const meta = {
  title: "Components/ImportUpload",
  component: ImportUpload,
  args: {
    file: null,
    reading: false,
    error: null,
    hasHeader: true,
    onHasHeaderChange: () => {},
    onFile: () => {},
    onRemove: () => {},
    onDownloadSample: () => {},
  },
  argTypes: { file: { control: false } },
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImportUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Before a file: the drop zone with the limits, and the sample file. */
export const Empty: Story = {};

export const Reading: Story = { args: { reading: true } };

/** A refused file: the reason under the zone. */
export const Refused: Story = {
  args: {
    error:
      "فایل با کدگذاری UTF-8 ذخیره نشده است؛ در Excel آن را با قالب «CSV UTF-8» ذخیره کنید.",
  },
};

/** The file read: name, rows, size, the header row and the separator found. */
export const FileRead: Story = {
  render: function Example(args) {
    const [hasHeader, setHasHeader] = useState(true);
    return (
      <ImportUpload
        {...args}
        file={SAMPLE_IMPORT_FILE_FA}
        hasHeader={hasHeader}
        onHasHeaderChange={setHasHeader}
      />
    );
  },
};
