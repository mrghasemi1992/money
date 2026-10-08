/*
 * Scale math for the hand-written charts: round axis steps and where a value sits on an axis.
 * Pure functions with no knowledge of money or the DOM.
 */

/** Steps an axis may take, times a power of ten. */
const NICE_STEPS = [1, 2, 2.5, 5, 10];

export type ChartAxis = {
  /** Bottom and top of the axis: round values that include 0 and every value. */
  min: number;
  max: number;
  /** Tick values from min to max, evenly spaced. */
  ticks: number[];
};

/** Drops the floating point noise of repeated additions (0.1 + 0.2). */
function clean(value: number): number {
  return Number(value.toPrecision(12));
}

/**
 * An axis from 0 (or below, for negative values) to the largest value, in about `count`
 * steps of 1, 2, 2.5 or 5 times a power of ten: values up to 37 → 0, 10, 20, 30, 40.
 */
export function niceAxis(values: number[], count = 4): ChartAxis {
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values);
  if (high === low) return { min: 0, max: 1, ticks: [0, 1] };

  const raw = (high - low) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step =
    NICE_STEPS.map((factor) => factor * magnitude).find(
      (nice) => nice >= raw,
    ) ?? raw;
  const min = clean(Math.floor(low / step) * step);
  const max = clean(Math.ceil(high / step) * step);
  const ticks: number[] = [];
  for (let index = 0; min + index * step <= max + step / 2; index++) {
    ticks.push(clean(min + index * step));
  }
  return { min, max, ticks };
}

/** Where a value sits on the axis, as a share of its height from the bottom: 0 … 1. */
export function axisShare(value: number, axis: ChartAxis): number {
  return (value - axis.min) / (axis.max - axis.min);
}
