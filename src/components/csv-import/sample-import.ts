import { SAMPLE_TRANSACTION_OPTIONS } from "@/components/transaction-list/sample-transactions";
import type { CsvFile, ImportDuplicate } from "@/types/csv";
import type { TransactionOptions } from "@/types/transaction";
import { parseCsvText } from "@/utils/csv-parse";

/*
 * Files and fakes for the import's stories: a Persian bank file with Jalali and Gregorian
 * dates, amounts in tomans, unknown names and a few bad rows (an empty amount, month 13, an
 * unknown type, a future date, «12,O00»), and an English one with signed amounts.
 */

/** The book the stories import into (the transactions stories' accounts and categories). */
export const SAMPLE_IMPORT_BOOK: TransactionOptions =
  SAMPLE_TRANSACTION_OPTIONS;

const FA_TEXT = `تاریخ,شرح,مبلغ,نوع,حساب,حساب مقصد,دسته,زیردسته,برچسب,یادداشت,مانده
۱۴۰۵/۰۶/۰۲,خرید هفتگی,۸۵۰٬۰۰۰,هزینه,ملی,,خوراک,سوپرمارکت,خانه,,۴۱٬۵۰۰٬۰۰۰
۱۴۰۵/۰۶/۰۳,حقوق شهریور,۴۵٬۰۰۰٬۰۰۰,درآمد,بانک ملی,,حقوق,حقوق ماهانه,,,۸۶٬۵۰۰٬۰۰۰
2026-08-27,تاکسی فرودگاه,۱۲۰٬۰۰۰,هزینه,کیف پول,,حمل‌ونقل,تاکسی,,پرواز مشهد,۸۶٬۳۸۰٬۰۰۰
۱۴۰۵/۰۶/۰۷,اینترنت خانه,۳۹۰٬۰۰۰,هزینه,بانک سامان,,اشتراک,,,,۸۵٬۹۹۰٬۰۰۰
2026-08-30,هدیه تولد,۶۰۰٬۰۰۰,هزینه,ملی,,هدیه,,خانواده,,۸۵٬۳۹۰٬۰۰۰
۱۴۰۵/۰۶/۱۰,پس‌انداز ماهانه,۵٬۰۰۰٬۰۰۰,انتقال,بانک ملی,صندوق پس‌انداز,,,,,۸۰٬۳۹۰٬۰۰۰
۱۴۰۵/۰۶/۱۱,خرید نان,,هزینه,بانک ملی,,خوراک,,,,۸۰٬۳۹۰٬۰۰۰
۱۴۰۵/۱۳/۰۲,کتاب,۳۲۰٬۰۰۰,هزینه,بانک سامان,,آموزش,,,,۸۰٬۰۷۰٬۰۰۰
۱۴۰۵/۰۶/۲۲,بازگشت وجه,۵۰۰٬۰۰۰,برگشتی,بانک ملی,,,,,,۸۰٬۵۷۰٬۰۰۰
۱۴۰۵/۰۸/۰۲,اجاره,۲۵٬۰۰۰٬۰۰۰,هزینه,بانک ملی,,خانه,اجاره,,,۵۵٬۵۷۰٬۰۰۰
2026-09-12,شیرینی,"12,O00",هزینه,کیف پول نقدی,,خوراک,,,,۵۵٬۵۵۸٬۰۰۰
۱۴۰۵/۰۶/۲۰,بنزین,۲۰۰٬۰۰۰,هزینه,کیف پول نقدی,,حمل‌ونقل,سوخت,سفر شمال,,۵۵٬۳۵۸٬۰۰۰
2026-09-14,,۹۰٬۰۰۰,هزینه,کیف پول نقدی,,,,,,۵۵٬۲۶۸٬۰۰۰
`;

const EN_TEXT = `Date,Description,Amount,Account,Category,Subcategory,Tags,Memo,Balance
2026-08-24,Weekly groceries,-85.00,Checking,Food,Supermarket,home,,415.00
2026-08-25,August salary,4500.00,Checking,Salary,,,,4915.00
1405/06/05,Airport taxi,-12.00,Wallet,Transport,Taxi,,Mashhad flight,4903.00
2026-08-29,Home internet,-39.00,Checking,Subscriptions,,,,4864.00
2026-08-30,Birthday gift,-60.00,Checking,Gifts,,family,,4804.00
2026-09-01,Bread,,Checking,Food,,,,4804.00
2026-13-02,Book,-32.00,Checking,Education,,,,4772.00
2026-09-12,Refund,"12,O00",Checking,,,,,4772.00
`;

function file(name: string, text: string): CsvFile {
  const { rows, delimiter } = parseCsvText(text);
  return {
    name,
    size: new TextEncoder().encode(text).length,
    delimiter,
    rows,
  };
}

/** A Persian bank file: separate type column, tomans, both calendars, five bad rows. */
export const SAMPLE_IMPORT_FILE_FA = file(
  "تراکنش‌های-شهریور-۱۴۰۵.csv",
  FA_TEXT,
);

/** An English file with signed amounts and one Jalali date. */
export const SAMPLE_IMPORT_FILE_EN = file(
  "transactions-august-2026.csv",
  EN_TEXT,
);

const wait = () => new Promise<void>((resolve) => setTimeout(resolve, 600));

/**
 * A fake duplicate check: the rows on «بانک ملی» from 1405/06/02 to 1405/06/03 look like
 * stored transactions.
 */
export async function sampleCheckDuplicates(
  query: { line: number; date: string; accountId: string }[],
): Promise<{ ok: true; duplicates: ImportDuplicate[] }> {
  await wait();
  const bank = SAMPLE_IMPORT_BOOK.accounts[0];
  return {
    ok: true,
    duplicates: query
      .filter((row) => row.accountId === bank?.id && row.date <= "2026-08-25")
      .map((row) => ({
        line: row.line,
        date: row.date,
        accountId: row.accountId,
        description: "خرید از فروشگاه",
      })),
  };
}
