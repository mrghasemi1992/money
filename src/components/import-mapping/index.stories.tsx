import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { type ComponentProps, useState } from "react";

import {
  SAMPLE_IMPORT_FILE_EN,
  SAMPLE_IMPORT_FILE_FA,
} from "@/components/csv-import/sample-import";
import {
  countImportCalendars,
  firstImportDate,
  guessAmountMode,
  guessColumnMap,
  recordCell,
  toImportRecords,
} from "@/helpers/csv-import";
import type { CsvFile } from "@/types/csv";
import type { RialUnit } from "@/types/currency";

import { ImportMapping } from "./index";

/** Placeholders: each story renders the step with its own state. */
const args: ComponentProps<typeof ImportMapping> = {
  headers: [],
  rows: [],
  mapping: guessColumnMap([]),
  onMappingChange: () => {},
  amountMode: "typed",
  onAmountModeChange: () => {},
  rialUnit: null,
  onRialUnitChange: () => {},
  showUnit: true,
  calendars: { jalali: 0, gregorian: 0 },
  sampleDate: null,
  sampleAmount: null,
};

const meta = {
  title: "Components/ImportMapping",
  component: ImportMapping,
  args,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ImportMapping>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The column step with working controls, for a file. */
function Example({
  file,
  showErrors = false,
  unit = null,
}: {
  file: CsvFile;
  showErrors?: boolean;
  unit?: RialUnit | null;
}) {
  const [mapping, setMapping] = useState(() => guessColumnMap(file.rows[0]!));
  const [mode, setMode] = useState(() => guessAmountMode(mapping));
  const [rialUnit, setRialUnit] = useState<RialUnit | null>(unit);
  const records = toImportRecords(file.rows, true, mapping, mode);
  return (
    <ImportMapping
      headers={file.rows[0] ?? []}
      rows={file.rows.slice(1)}
      mapping={mapping}
      onMappingChange={(field, column) =>
        setMapping((current) => ({ ...current, [field]: column }))
      }
      amountMode={mode}
      onAmountModeChange={setMode}
      rialUnit={rialUnit}
      onRialUnitChange={setRialUnit}
      showUnit
      calendars={countImportCalendars(records)}
      sampleDate={firstImportDate(records)}
      sampleAmount={
        records.map((r) => recordCell(r, "amount")).find(Boolean) ?? null
      }
      showErrors={showErrors}
    />
  );
}

/**
 * A Persian bank file: the columns found from their names, a separate type column, dates of
 * both calendars, and the unit still to choose.
 */
export const Default: Story = {
  render: () => <Example file={SAMPLE_IMPORT_FILE_FA} />,
};

/** «بعدی» pressed without a unit: the unit asks for one. */
export const MissingUnit: Story = {
  render: () => <Example file={SAMPLE_IMPORT_FILE_FA} showErrors />,
};

/** Tomans chosen: the hint shows what the first amount is saved as. */
export const Toman: Story = {
  render: () => <Example file={SAMPLE_IMPORT_FILE_FA} unit="toman" />,
};

/** An English file with signed amounts: the type column isn't needed. */
export const SignedAmounts: Story = {
  render: () => <Example file={SAMPLE_IMPORT_FILE_EN} unit="rial" showErrors />,
};

export const Mobile: Story = {
  ...Default,
  globals: { viewport: { value: "mobile2", isRotated: false } },
};
