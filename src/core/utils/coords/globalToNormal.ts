import { CANVAS_END_START_BUFFER } from "~/core/constants";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { ActionOptions } from "~/core/state/stateTypes";
import { lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getGraphEditorViewport } from "~/core/utils/viewportUtils";
import { Rect, ViewBounds, YBounds } from "~/types/commonTypes";
import { TimelineMap } from "~/types/timelineTypes";

interface Options {
  viewport: Rect;
  graphEditorViewport: Rect;
  length: number;
  viewBounds: ViewBounds;
  timelines: TimelineMap;
  yBounds?: YBounds;
}

export const createGlobalToNormalFn = (options: Options) => {
  const { timelines, viewBounds, viewport, graphEditorViewport, length } = options;

  const yBounds =
    options.yBounds ||
    getGraphEditorYBounds({
      length,
      timelines,
      viewBounds,
    });

  const [xMin, xMax] = viewBounds;

  const canvasWidth = graphEditorViewport.width - CANVAS_END_START_BUFFER * 2;
  const canvasLeft = graphEditorViewport.left + CANVAS_END_START_BUFFER;

  const globalToNormal = (vec: Vec2): Vec2 => {
    const pos = vec.subY(viewport.top + graphEditorViewport.top).subX(viewport.left + canvasLeft);
    const xt = pos.x / canvasWidth;
    const yt = pos.y / graphEditorViewport.height;
    pos.x = (xMin + (xMax - xMin) * xt) * length;
    pos.y = lerp(yBounds[0], yBounds[1], yt);
    return pos;
  };

  return globalToNormal;
};

export const createGlobalToNormalFnFromActionOptions = (options: ActionOptions) => {
  const { initialState } = options;

  const { timelines } = initialState.primary;
  const { viewport, viewBounds, viewBoundsHeight, scrubberHeight, length } = initialState.view;

  const graphEditorViewport = getGraphEditorViewport({
    viewport,
    viewBoundsHeight,
    scrubberHeight,
  });

  return createGlobalToNormalFn({ viewport, graphEditorViewport, viewBounds, timelines, length });
};
