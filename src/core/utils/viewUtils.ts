import { ViewBounds } from "~/types/commonTypes";

interface ShiftByTOptions {
  allowExceedViewBounds: boolean;
  viewBounds: ViewBounds;
}

export function shiftViewBoundsByT(viewState: ShiftByTOptions, tChange: number): ViewBounds {
  const { allowExceedViewBounds, viewBounds } = viewState;

  const rightShiftMax = 1 - viewBounds[1];
  const leftShiftMax = -viewBounds[0];

  let newBounds = [viewBounds[0], viewBounds[1]] as [number, number];
  if (!allowExceedViewBounds && tChange > rightShiftMax) {
    newBounds[1] = 1;
    newBounds[0] += rightShiftMax;
  } else if (!allowExceedViewBounds && tChange < leftShiftMax) {
    newBounds[0] = 0;
    newBounds[1] += leftShiftMax;
  } else {
    newBounds[0] += tChange;
    newBounds[1] += tChange;
  }

  return newBounds;
}

interface ShiftByXOptions extends ShiftByTOptions {
  length: number;
}

/**
 * Returns new `ViewBounds` that have been shifted by N normal units,
 * specified by the `shiftByX` argument.
 */
export function shiftViewBoundsByX(options: ShiftByXOptions, shiftByX: number): ViewBounds {
  const { length } = options;
  return shiftViewBoundsByT(options, shiftByX / length);
}
