import {
  ActionOptions,
  Rect,
  TimelineMap,
  TimelineSelectionState,
  ViewBounds,
  YBounds,
} from "timelime/types";
import { CANVAS_END_START_BUFFER } from "~core/constants";
import { getGraphEditorYBounds } from "~core/render/yBounds";
import { lerp, lerpInCanvasRange } from "~core/utils/math/math";
import { Vec2 } from "~core/utils/math/Vec2";
import { getGraphEditorViewport } from "~core/utils/viewportUtils";

export const createNormalToViewportXFn = (options: {
  length: number;
  viewBounds: ViewBounds;
  graphEditorViewport: Rect;
  pan?: Vec2;
}): ((value: number) => number) => {
  const { viewBounds, length, graphEditorViewport, pan = Vec2.ORIGIN } = options;

  const realWidth = graphEditorViewport.width;
  const renderWidth = realWidth;
  const canvasWidth = realWidth - CANVAS_END_START_BUFFER * 2;

  let [tMin, tMax] = viewBounds;
  tMin += pan.x / length;
  tMax += pan.x / length;

  return (index: number) => {
    const t = index / length;
    return (
      lerpInCanvasRange(t * renderWidth, tMin * renderWidth, tMax * renderWidth, canvasWidth) +
      CANVAS_END_START_BUFFER
    );
  };
};

export const createNormalToViewportYFn = (options: {
  viewBounds: ViewBounds;
  length: number;
  timelines: TimelineMap;
  timelineSelectionState: TimelineSelectionState;
  graphEditorViewport: Rect;
  yBounds?: YBounds;
  pan?: Vec2;
}): ((value: number) => number) => {
  const {
    timelines,
    timelineSelectionState,
    graphEditorViewport,
    viewBounds,
    length,
    yBounds,
    pan = Vec2.ORIGIN,
  } = options;

  const [yUpper, yLower] =
    yBounds || getGraphEditorYBounds({ viewBounds, length, timelines, timelineSelectionState });
  const yUpLowDiff = yUpper - yLower;

  return (value: number) => {
    const t = (value - pan.y - yLower) / yUpLowDiff;
    return graphEditorViewport.top + lerp(graphEditorViewport.height, 0, t);
  };
};

export const createNormalToViewportFn = (options: {
  viewBounds: ViewBounds;
  length: number;
  timelines: TimelineMap;
  timelineSelectionState: TimelineSelectionState;
  graphEditorViewport: Rect;
  yBounds?: YBounds;
  pan?: Vec2;
}) => {
  const toX = createNormalToViewportXFn(options);
  const toY = createNormalToViewportYFn(options);

  return (vec: Vec2) => Vec2.new(toX(vec.x), toY(vec.y));
};

export const createNormalToViewportFnFromActionOptions = (options: ActionOptions) => {
  const { initialState } = options;

  const { timelines } = initialState.primary;
  const timelineSelectionState = initialState.selection;
  const { viewBounds, length, viewBoundsHeight, scrubberHeight, viewport } = initialState.view;

  const graphEditorViewport = getGraphEditorViewport({
    viewBoundsHeight,
    scrubberHeight,
    viewport,
  });

  return createNormalToViewportFn({
    graphEditorViewport,
    viewBounds,
    timelines,
    timelineSelectionState,
    length,
  });
};
