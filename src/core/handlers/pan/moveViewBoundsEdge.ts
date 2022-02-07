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

      const prevT = getMousePositionT(initialMousePosition.viewport);
      const currT = getMousePositionT(mousePosition.viewport);

      const tChange = currT - prevT;

      const tPerFrame = 1 / viewState.length;
      let [t0, t1] = viewState.viewBounds;

      if (which === "left") {
        t0 += tChange;
        t0 = Math.min(t0, t1 - tPerFrame * MIN_VIEW_BOUNDS_INDEX_DIFFERENCE);
      } else {
        t1 += tChange;
        t1 = Math.max(t1, t0 + tPerFrame * MIN_VIEW_BOUNDS_INDEX_DIFFERENCE);
      }

      return [t0, t1];
    },
  });
}

export const onMoveViewBoundsEdgeLeft = createMoveViewBoundsEdgeHandler("left");
export const onMoveViewBoundsEdgeRight = createMoveViewBoundsEdgeHandler("right");
