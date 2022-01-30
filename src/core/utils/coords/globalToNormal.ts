import { CANVAS_END_START_BUFFER } from "~/core/constants";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, ViewBounds, YBounds } from "~/types/commonTypes";
import { TimelineMap } from "~/types/timelineTypes";

interface Options {
  viewport: Rect;

  length: number;

  /** @default [0, 1] */
  viewBounds?: ViewBounds;

  timelines: TimelineMap;

  yBounds?: YBounds;
}

export const createGlobalToNormalFn = (options: Options) => {
  const { viewport, timelines, viewBounds = [0, 1], length } = options;

  const yBounds =
    options.yBounds ||
    getGraphEditorYBounds({
      length,
      timelines,
      viewBounds,
    });

  const [xMin, xMax] = viewBounds;

  const canvasWidth = viewport.width - CANVAS_END_START_BUFFER * 2;
  const canvasLeft = viewport.left + CANVAS_END_START_BUFFER;

  const globalToNormal = (vec: Vec2): Vec2 => {
    const pos = vec.subY(viewport.top).subX(canvasLeft);
    const xt = pos.x / canvasWidth;
    const yt = pos.y / viewport.height;
    pos.x = (xMin + (xMax - xMin) * xt) * length;
    pos.y = lerp(yBounds[0], yBounds[1], yt);
    return pos;
  };

  return globalToNormal;
};
