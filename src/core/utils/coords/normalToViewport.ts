import { CANVAS_END_START_BUFFER } from "~/core/constants";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { lerp, lerpInCanvasRange } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, ViewBounds, YBounds } from "~/types/commonTypes";
import { TimelineMap } from "~/types/timelineTypes";

export const createNormalToViewportXFn = (options: {
  length: number;
  viewBounds: ViewBounds;
  viewport: Rect;
}): ((value: number) => number) => {
  const { viewBounds, length, viewport } = options;

  const realWidth = viewport.width;
  const renderWidth = realWidth;
  const canvasWidth = realWidth - CANVAS_END_START_BUFFER * 2;

  const [tMin, tMax] = viewBounds;

  return (index: number) => {
    const t = index / length;
    return (
      lerpInCanvasRange(
        t * renderWidth,
        tMin * renderWidth,
        tMax * renderWidth,
        canvasWidth
      ) + CANVAS_END_START_BUFFER
    );
  };
};

export const createNormalToViewportYFn = (options: {
  viewBounds: ViewBounds;
  length: number;
  timelines: TimelineMap;
  viewport: Rect;
  yBounds?: YBounds;
  yPan?: number;
}): ((value: number) => number) => {
  const {
    timelines,
    viewport,
    viewBounds,
    length,
    yBounds,
    yPan = 0,
  } = options;

  const [yUpper, yLower] =
    yBounds || getGraphEditorYBounds({ viewBounds, length, timelines });
  const yUpLowDiff = yUpper - yLower;

  return (value: number) => {
    const t = (value - yPan - yLower) / yUpLowDiff;
    return lerp(viewport.height, 0, t);
  };
};

export const createNormalToViewportFn = (options: {
  viewBounds: ViewBounds;
  length: number;
  timelines: TimelineMap;
  viewport: Rect;
  yBounds?: YBounds;
  yPan?: number;
}) => {
  const toX = createNormalToViewportXFn(options);
  const toY = createNormalToViewportYFn(options);

  return (vec: Vec2) => Vec2.new(toX(vec.x), toY(vec.y));
};
