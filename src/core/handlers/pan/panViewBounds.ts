import { VIEW_BOUNDS_HANDLE_WIDTH } from "~/core/constants";
import { createPanHandler } from "~/core/handlers/pan/createPanHandler";
import { Vec2 } from "~/core/utils/math/Vec2";
import { shiftViewBoundsByT } from "~/core/utils/viewUtils";

export const onPanViewBounds = createPanHandler({
  getNextViewBounds: ({ viewport, viewState, mousePosition, initialMousePosition }) => {
    const getMousePositionT = (viewportMousePosition: Vec2) => {
      const w = viewport.width - VIEW_BOUNDS_HANDLE_WIDTH * 2;
      return viewportMousePosition.subX(VIEW_BOUNDS_HANDLE_WIDTH).x / w;
    };

    const initialT = getMousePositionT(initialMousePosition.viewport);
    const t = getMousePositionT(mousePosition.viewport);
    const tChange = t - initialT;

    const viewBounds = shiftViewBoundsByT(viewState, tChange);
    return viewBounds;
  },
});
