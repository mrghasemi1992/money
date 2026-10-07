import {
  TRANSACTION_SEARCH_MAX_LENGTH,
  TRANSACTION_TAG_MAX_LENGTH,
  TRANSACTION_TYPES,
} from "@/constants/transaction";
import type { CalendarSystem } from "@/types/calendar";
import type {
  TransactionFilterParams,
  TransactionFilters,
  TransactionType,
} from "@/types/transaction";
import { monthRange, toCalendarDate } from "@/utils/calendar";
import { isIsoDate } from "@/utils/iso-date";

/*
 * The transactions page keeps its filters in the URL, so a filtered view can be shared and
 * survives a refresh: /transactions?month=1405-07&type=expense&category=<id>&q=کافه.
 *
 * `month` is a month of the calendar its year belongs to: Jalali years are below 1700
 * («1405-07» is Mehr 1405), Gregorian years above («2026-10»). A viewer with the other
 * calendar sees that month as a date range. `from` and `to` are ISO dates and replace the
 * month. Without either, the page shows the viewer's current month.
 */

export const TRANSACTION_PARAMS = {
  month: "month",
  from: "from",
  to: "to",
  type: "type",
  account: "account",
  category: "category",
  tag: "tag",
  search: "q",
  unknown: "unknown",
} as const;

/** Below this, a `month` year is Jalali (1700 SH is 2321 CE); from it on, Gregorian. */
const FIRST_GREGORIAN_YEAR = 1700;

const MONTH_PARAM = /^(\d{4})-(\d{2})$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ParamSource =
  URLSearchParams | Record<string, string | string[] | undefined>;

function getAll(source: ParamSource, key: string): string[] {
  if (source instanceof URLSearchParams) return source.getAll(key);
  const value = source[key];
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function getOne(source: ParamSource, key: string): string | null {
  return getAll(source, key)[0] ?? null;
}

/** «1405-07» → Mehr 1405 (Jalali); «2026-10» → October 2026. Null when it isn't a month. */
export function parseMonthParam(
  value: string | null,
): TransactionFilterParams["month"] {
  const match = value ? MONTH_PARAM.exec(value) : null;
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  const calendar: CalendarSystem =
    year < FIRST_GREGORIAN_YEAR ? "jalali" : "gregorian";
  return { calendar, year, month };
}

export function formatMonthParam(year: number, month: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}`;
}

function isoOrNull(value: string | null): string | null {
  return value && isIsoDate(value) ? value : null;
}

/** Reads the filters from the URL, dropping anything that isn't valid. */
export function parseTransactionParams(
  source: ParamSource,
): TransactionFilterParams {
  const P = TRANSACTION_PARAMS;
  let from = isoOrNull(getOne(source, P.from));
  let to = isoOrNull(getOne(source, P.to));
  if (from && to && from > to) [from, to] = [to, from];

  const types = TRANSACTION_TYPES.filter((type) =>
    getAll(source, P.type).includes(type),
  );
  const account = getOne(source, P.account);
  const category = getOne(source, P.category);
  const tag = getOne(source, P.tag)?.trim() ?? "";

  return {
    month: parseMonthParam(getOne(source, P.month)),
    from,
    to,
    types,
    accountId: account && UUID.test(account) ? account.toLowerCase() : null,
    categoryId: category && UUID.test(category) ? category.toLowerCase() : null,
    tag: tag && tag.length <= TRANSACTION_TAG_MAX_LENGTH ? tag : null,
    search: (getOne(source, P.search) ?? "")
      .trim()
      .slice(0, TRANSACTION_SEARCH_MAX_LENGTH),
    unknownOnly: getOne(source, P.unknown) === "1",
  };
}

/** The URL query for the filters («?month=1405-07&type=expense»), or "" for none. */
export function transactionParamsToSearch(
  params: TransactionFilterParams,
): string {
  const P = TRANSACTION_PARAMS;
  const search = new URLSearchParams();
  if (params.from || params.to) {
    if (params.from) search.set(P.from, params.from);
    if (params.to) search.set(P.to, params.to);
  } else if (params.month) {
    search.set(
      P.month,
      formatMonthParam(params.month.year, params.month.month),
    );
  }
  for (const type of params.types) search.append(P.type, type);
  if (params.accountId) search.set(P.account, params.accountId);
  if (params.categoryId) search.set(P.category, params.categoryId);
  if (params.tag) search.set(P.tag, params.tag);
  if (params.search) search.set(P.search, params.search);
  if (params.unknownOnly) search.set(P.unknown, "1");
  const query = search.toString();
  return query ? `?${query}` : "";
}

/**
 * The period the list shows: a month of the viewer's calendar (with its Gregorian range, from
 * monthRange), or a date range when the URL has `from` / `to` or a month of the other calendar.
 */
export type TransactionPeriod =
  | {
      kind: "month";
      year: number;
      month: number;
      from: string;
      to: string;
      /** The viewer's current month or a later one: there is no next month to go to. */
      isCurrent: boolean;
    }
  | { kind: "range"; from: string | null; to: string | null };

export function resolveTransactionPeriod(
  params: TransactionFilterParams,
  calendar: CalendarSystem,
  today: string,
): TransactionPeriod {
  if (params.from || params.to) {
    return { kind: "range", from: params.from, to: params.to };
  }
  if (params.month && params.month.calendar !== calendar) {
    const range = monthRange(
      params.month.calendar,
      params.month.year,
      params.month.month,
    );
    return { kind: "range", from: range.start, to: range.end };
  }
  const current = toCalendarDate(today, calendar);
  const { year, month } = params.month ?? current;
  const range = monthRange(calendar, year, month);
  return {
    kind: "month",
    year,
    month,
    from: range.start,
    to: range.end,
    isCurrent: year * 12 + month >= current.year * 12 + current.month,
  };
}

/** The filters for a query: the period as Gregorian dates, plus the rest. */
export function toTransactionFilters(
  params: TransactionFilterParams,
  period: TransactionPeriod,
): TransactionFilters {
  return {
    from: period.from,
    to: period.to,
    types: params.types,
    accountId: params.accountId,
    categoryId: params.categoryId,
    tag: params.tag,
    search: params.search,
    unknownOnly: params.unknownOnly,
  };
}

/** Filters set besides the period: type, account, category, tag, search, unknown only. */
export function countFilters(params: TransactionFilterParams): number {
  return (
    params.types.length +
    (params.accountId ? 1 : 0) +
    (params.categoryId ? 1 : 0) +
    (params.tag ? 1 : 0) +
    (params.search ? 1 : 0) +
    (params.unknownOnly ? 1 : 0)
  );
}

/** No filters and no period: the current month. */
export const EMPTY_TRANSACTION_PARAMS: TransactionFilterParams = {
  month: null,
  from: null,
  to: null,
  types: [],
  accountId: null,
  categoryId: null,
  tag: null,
  search: "",
  unknownOnly: false,
};

/** Toggles a type in a list, keeping the form's order. */
export function toggleType(
  types: TransactionType[],
  type: TransactionType,
): TransactionType[] {
  return TRANSACTION_TYPES.filter((item) =>
    item === type ? !types.includes(item) : types.includes(item),
  );
}
