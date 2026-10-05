import type { Currency } from "./currency";

/** Settings of the one shared book, chosen by an admin. */
export type BookSettings = {
  /** All amounts are in this currency. Changeable only while the book holds no amounts. */
  currency: Currency;
};
