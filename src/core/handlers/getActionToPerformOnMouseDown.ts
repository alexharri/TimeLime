import { isKeyDown } from "~/core/listener/keyboard";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { TimelineSelectionState } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { createNormalToViewportFn } from "~/core/utils/coords/normalToViewport";
import { getGraphEditorTargetObject } from "~/core/utils/getGraphEditorTargetObject";
import { expandRect, isVecInRect } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getViewBoundHandleRects } from "~/core/utils/viewBoundsUtils";
import { getGraphEditorViewport, getScrubberViewport } from "~/core/utils/viewportUtils";
import { ActionToPerform, Rect, ViewBounds } from "~/types/commonTypes";
import { TimelineMap } from "~/types/timelineTypes";

interface ActionToPerformOptions {
  globalMousePosition: Vec2;
  timelines: TimelineMap;
  timelineSelectionState: TimelineSelectionState;
  viewport: Rect;
  length: number;
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
  scrubberHeight: number;
}

export const getActionToPerformOnMouseDown = (options: ActionToPerformOptions): ActionToPerform => {
  const {
    globalMousePosition,
    timelines,
    timelineSelectionState,
    viewBounds,
    length,
    viewport,
    viewBoundsHeight,
    scrubberHeight,
  } = options;

  if (isKeyDown("Space")) {
    return { type: "pan" };
  }

  if (isKeyDown("Z")) {
    return { type: isKeyDown("Alt") ? "zoom_out" : "zoom_in" };
  }

  const viewportMousePosition = globalMousePosition.subXY(viewport.left, viewport.top);

  if (viewBoundsHeight > 0) {
    const handleRects = getViewBoundHandleRects({ viewport, viewBounds, viewBoundsHeight });

    for (const which of <const>["left", "right"]) {
      if (isVecInRect(viewportMousePosition, expandRect(handleRects[which], 2))) {
        return { type: "mousedown_view_bounds_handle", which };
      }
    }

    const viewBoundsBarRect: Rect = {
      left: handleRects.left.left,
      top: 0,
      height: handleRects.left.height,
      width: handleRects.right.left + handleRects.right.width - handleRects.left.left,
    };

    if (isVecInRect(viewportMousePosition, viewBoundsBarRect)) {
      return { type: "pan_view_bounds" };
    }
  }

  const scrubberViewport = getScrubberViewport({
    scrubberHeight,
    viewBoundsHeight,
    viewport,
  });
  if (scrubberHeight > 0 && isVecInRect(viewportMousePosition, scrubberViewport)) {
    return { type: "scrub" };
  }

  const graphEditorViewport = getGraphEditorViewport(options);

  const yBounds = getGraphEditorYBounds({
    length,
    timelines,
    timelineSelectionState,
    viewBounds,
  });

  const normalToViewport = createNormalToViewportFn({
    yBounds,
    viewBounds,
    length,
    timelines,
    timelineSelectionState,
    graphEditorViewport,
  });

  const timelineList = Object.values(timelines);

  for (const timeline of timelineList) {
    const timelineId = timeline.id;

    const target = getGraphEditorTargetObject(timeline, viewportMousePosition, normalToViewport);

    switch (target.type) {
      case "keyframe": {
        if (isKeyDown("Alt")) {
          return {
            type: "alt_mousedown_keyframe",
            timelineId,
            keyframe: target.keyframe,
          };
        }
        return {
          type: "mousedown_keyframe",
          timelineId,
          keyframe: target.keyframe,
        };
      }
      case "control_point": {
        return {
          type: "mousedown_control_point",
          timelineId,
          keyframe: target.keyframe,
          which: target.which,
        };
      }
      case "none":
        continue;
    }
  }

  return { type: "mousedown_empty" };
};
