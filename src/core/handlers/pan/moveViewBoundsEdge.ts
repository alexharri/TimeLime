import { MIN_VIEW_BOUNDS_INDEX_DIFFERENCE, VIEW_BOUNDS_HANDLE_WIDTH } from "~/core/constants";
import { createPanHandler } from "~/core/handlers/pan/createPanHandler";
import { Vec2 } from "~/core/utils/math/Vec2";

function createMoveViewBoundsEdgeHandler(which: "left" | "right") {
  return createPanHandler({
    getNextViewBounds: ({ viewport, viewState, mousePosition, initialMousePosition }) => {
      const getMousePositionT = (viewportMousePosition: Vec2) => {
        const w = viewport.width - VIEW_BOUNDS_HANDLE_WIDTH * 2;
        return viewportMousePosition.subX(VIEW_BOUNDS_HANDLE_WIDTH).x / w;
      };

      const initialT = getMousePositionT(initialMousePosition.viewport);
      const t = getMousePositionT(mousePosition.viewport);
      const tChange = t - initialT;

      const minDifference = MIN_VIEW_BOUNDS_INDEX_DIFFERENCE / viewState.length;

      let [t0, t1] = viewState.viewBounds;

      if (which === "left") {
        t0 = Math.min(t0 + tChange, t1 - minDifference);
      } else {
        t1 = Math.max(t1 + tChange, t0 + minDifference);
      }

      return [t0, t1];
    },
  });
}

export const onMoveViewBoundsEdgeLeft = createMoveViewBoundsEdgeHandler("left");
export const onMoveViewBoundsEdgeRight = createMoveViewBoundsEdgeHandler("right");
