import { TIMELINE_CANVAS_END_START_BUFFER } from "~/core/constants";
import { getGraphEditorYBoundsFromPaths } from "~/core/render/yBounds";
import { lerp, lerpInCanvasRange } from "~/core/utils/math/math";
import { Curve, ViewBounds } from "~/types/commonTypes";
import { Timeline } from "~/types/timelineTypes";

export const createGraphEditorNormalToViewportX = (options: {
  length: number;
  viewBounds: ViewBounds;
  width: number;
}): ((value: number) => number) => {
  const { viewBounds, length, width: realWidth } = options;

  const renderWidth = realWidth;
  const canvasWidth = realWidth - TIMELINE_CANVAS_END_START_BUFFER * 2;

  const [tMin, tMax] = viewBounds;

  return (index: number) => {
    const t = index / length;
    return (
      lerpInCanvasRange(
        t * renderWidth,
        tMin * renderWidth,
        tMax * renderWidth,
        canvasWidth
      ) + TIMELINE_CANVAS_END_START_BUFFER
    );
  };
};

export const createGraphEditorNormalViewportY = (
  timelinePaths: Curve[][],
  options: {
    viewBounds: [number, number];
    length: number;
    timelines: Timeline[];
    height: number;
    yBounds?: [number, number];
    yPan?: number;
  }
): ((value: number) => number) => {
  const { timelines, height, viewBounds, length, yBounds, yPan = 0 } = options;

  const [yUpper, yLower] =
    yBounds ||
    getGraphEditorYBoundsFromPaths({
      viewBounds,
      length,
      timelines,
      timelineCurves: timelinePaths,
    });
  const yUpLowDiff = yUpper - yLower;

  return (value: number) => {
    const t = (value - yPan - yLower) / yUpLowDiff;
    return lerp(height, 0, t);
  };
};
