import { Rect } from "timelime/types";
import { Vec2 } from "~core/utils/math/Vec2";

export const getViewportYUpperLower = (
  viewport: Rect,
  mousePositionGlobal: Vec2,
): [yUpper: number, yLower: number] => {
  const { y } = mousePositionGlobal;
  const buffer = 15;
  const yUpper = Math.max(0, viewport.top - (y - buffer));
  const yLower = Math.max(0, y + buffer - (viewport.top + viewport.height));
  return [yUpper, yLower];
};

export const getViewportXUpperLower = (
  viewport: Rect,
  mousePositionGlobal: Vec2,
): [xUpper: number, xLower: number] => {
  const { x } = mousePositionGlobal;
  const buffer = 15;
  const xUpper = Math.max(0, viewport.left - (x - buffer));
  const xLower = Math.max(0, x + buffer - (viewport.left + viewport.width));
  return [xUpper, xLower];
};

interface GetGraphEditorViewportOptions {
  viewport: Rect;
  viewBoundsHeight: number;
  scrubberHeight: number;
}

export function getGraphEditorViewport(options: GetGraphEditorViewportOptions): Rect {
  const { viewport, viewBoundsHeight, scrubberHeight } = options;

  return {
    left: 0,
    top: viewBoundsHeight + scrubberHeight,
    height: viewport.height - viewBoundsHeight - scrubberHeight,
    width: viewport.width,
  };
}

interface GetScrubberViewportOptions {
  viewport: Rect;
  viewBoundsHeight: number;
  scrubberHeight: number;
}

export function getScrubberViewport(options: GetScrubberViewportOptions): Rect {
  const { viewport, viewBoundsHeight, scrubberHeight } = options;

  return {
    left: 0,
    top: viewBoundsHeight,
    height: scrubberHeight,
    width: viewport.width,
  };
}
