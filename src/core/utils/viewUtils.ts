import { ViewState } from "~/core/state/stateTypes";
import { ViewBounds } from "~/types/commonTypes";

export function shiftViewBoundsByT(
  viewState: ViewState,
  tChange: number
): ViewBounds {
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

/**
 * Returns new `ViewBounds` that have been shifted by N normal units,
 * specified by the `shiftByX` argument.
 */
export function shiftViewBoundsByX(
  viewState: ViewState,
  shiftByX: number
): ViewBounds {
  const { length } = viewState;
  return shiftViewBoundsByT(viewState, shiftByX / length);
}
