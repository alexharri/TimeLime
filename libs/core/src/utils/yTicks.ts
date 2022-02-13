import { YBounds } from "timelime/types";

export const generateGraphEditorYTicksFromBounds = ([a, b]: YBounds): number[] => {
  const diff = Math.abs(a - b);

  let fac = 0.0001;
  const multipliers = [0.1, 0.25, 0.5];
  let tickBy!: number;

  outer: while (fac < 100_000_000) {
    for (let i = 0; i < multipliers.length; i += 1) {
      if (diff < fac * multipliers[i] * 10) {
        tickBy = fac * multipliers[i];
        break outer;
      }
    }
    fac *= 10;
  }

  if (!tickBy) {
    return [];
  }

  const lower = Math.min(a, b);
  const upper = Math.max(a, b);

  const ticks: number[] = [Math.floor(lower / tickBy) * tickBy];
  do {
    ticks.push(ticks[ticks.length - 1] + tickBy);
  } while (ticks[ticks.length - 1] < upper);

  return ticks.map((tick) => Number(tick.toFixed(10)));
};
