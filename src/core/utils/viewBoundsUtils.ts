import { VIEW_BOUNDS_HANDLE_WIDTH } from "~/core/constants";
import { Rect, ViewBounds } from "~/types/commonTypes";

interface Options {
  viewport: Rect;
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
}

export function getViewBoundHandleRects(options: Options) {
  const { viewport, viewBounds, viewBoundsHeight } = options;

  const w = viewport.width - VIEW_BOUNDS_HANDLE_WIDTH * 2;

  const firstLeft = Math.floor(viewBounds[0] * w);
  const secondLeft = Math.ceil(VIEW_BOUNDS_HANDLE_WIDTH + viewBounds[1] * w);

  const width = VIEW_BOUNDS_HANDLE_WIDTH;

  const left: Rect = { width, height: viewBoundsHeight, top: 0, left: firstLeft };
  const right: Rect = { width, height: viewBoundsHeight, top: 0, left: secondLeft };

  return { left, right };
}
