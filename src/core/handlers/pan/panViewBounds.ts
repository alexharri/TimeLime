import { VIEW_BOUNDS_HANDLE_WIDTH } from "~/core/constants";
import { createPanHandler } from "~/core/handlers/pan/createPanHandler";
import { base64Cursors } from "~/core/utils/cursor/base64Cursors";
import { Vec2 } from "~/core/utils/math/Vec2";
import { shiftViewBoundsByT } from "~/core/utils/viewUtils";

export const onPanViewBounds = createPanHandler({
  cursor: base64Cursors.selection_move_horizontal,
  getNextViewBounds: ({ viewport, viewState, mousePosition, initialMousePosition }) => {
    const getMousePositionT = (viewportMousePosition: Vec2) => {
      const w = viewport.width - VIEW_BOUNDS_HANDLE_WIDTH * 2;
      return viewportMousePosition.subX(VIEW_BOUNDS_HANDLE_WIDTH).x / w;
    };

    const initialT = getMousePositionT(initialMousePosition.viewport);
    const t = getMousePositionT(mousePosition.viewport);
    const tChange = t - initialT;

    return shiftViewBoundsByT(viewState, tChange);
  },
});
