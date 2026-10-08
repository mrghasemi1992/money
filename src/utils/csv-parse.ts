import Papa from "papaparse";

/*
 * Reading CSV files in the browser with Papa Parse: it follows RFC 4180 (quoted fields with
 * commas, quotes and line breaks inside), drops the UTF-8 byte order mark, detects the
 * delimiter (Excel saves with «;» in many locales) and reads a File without extra code.
 */

/** Delimiters tried, in order, when detecting. */
const DELIMITERS = [",", ";", "\t", "|"];

export type ParsedCsv = {
  rows: string[][];
  delimiter: string;
};

/**
 * Reads a UTF-8 CSV file as text cells, the header row included. Empty lines are skipped;
 * cells are trimmed. Rejects when the file can't be read. Stops after `rowLimit` rows, so a
 * huge file isn't read to the end only to be refused.
 */
export function parseCsvFile(file: File, rowLimit: number): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      delimitersToGuess: DELIMITERS,
      skipEmptyLines: "greedy",
      preview: rowLimit,
      encoding: "utf-8",
      transform: (value) => value.trim(),
      complete: (result) =>
        resolve({ rows: result.data, delimiter: result.meta.delimiter }),
      error: (error) => reject(error),
    });
  });
}

/** Parses CSV text (for stories and samples). Same rules as `parseCsvFile`. */
export function parseCsvText(text: string): ParsedCsv {
  const result = Papa.parse<string[]>(text, {
    delimitersToGuess: DELIMITERS,
    skipEmptyLines: "greedy",
    transform: (value) => value.trim(),
  });
  return { rows: result.data, delimiter: result.meta.delimiter };
}

/**
 * Whether the text came from a file that isn't UTF-8 (Excel's «CSV» in a Persian Windows is
 * Windows-1256): the decoder turned its bytes into replacement characters.
 */
export function hasEncodingErrors(rows: string[][]): boolean {
  return rows.some((row) => row.some((cell) => cell.includes("\uFFFD")));
}
