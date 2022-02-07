import { createPanHandler } from "~/core/handlers/pan/createPanHandler";
import { shiftViewBoundsByT } from "~/core/utils/viewUtils";

export const onPan = createPanHandler({
  getNextViewBounds: ({ viewState, mousePosition, initialMousePosition }) => {
    const { length } = viewState;
    const initialT = initialMousePosition.normal.x / length;
    const t = mousePosition.normal.x / length;
    const tChange = (t - initialT) * -1;
    return shiftViewBoundsByT(viewState, tChange);
  },
});
