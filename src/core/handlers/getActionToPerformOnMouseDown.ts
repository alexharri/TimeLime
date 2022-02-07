import { isKeyDown } from "~/core/listener/keyboard";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { createNormalToViewportFn } from "~/core/utils/coords/normalToViewport";
import { getGraphEditorTargetObject } from "~/core/utils/getGraphEditorTargetObject";
import { expandRect, isVecInRect } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getViewBoundHandleRects } from "~/core/utils/viewBoundsUtils";
import { getGraphEditorViewport } from "~/core/utils/viewportUtils";
import { Rect, ViewBounds } from "~/types/commonTypes";
import { TimelineKeyframe, TimelineMap } from "~/types/timelineTypes";

type ActionToPerform =
  | {
      type: "alt_mousedown_keyframe";
      timelineId: string;
      keyframe: TimelineKeyframe;
    }
  | {
      type: "mousedown_keyframe";
      timelineId: string;
      keyframe: TimelineKeyframe;
    }
  | {
      type: "mousedown_control_point";
      timelineId: string;
      keyframe: TimelineKeyframe;
      which: "left" | "right";
    }
  | {
      type: "mousedown_empty";
    }
  | {
      type: "pan";
    }
  | {
      type: "zoom_out";
    }
  | {
      type: "zoom_in";
    }
  | {
      type: "pan_view_bounds";
    }
  | {
      type: "mousedown_view_bounds_handle";
      which: "left" | "right";
    };

interface ActionToPerformOptions {
  globalMousePosition: Vec2;
  timelines: TimelineMap;
  viewport: Rect;
  length: number;
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
}

export const getActionToPerformOnMouseDown = (options: ActionToPerformOptions): ActionToPerform => {
  const { globalMousePosition, timelines, viewBounds, length, viewport, viewBoundsHeight } =
    options;

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

  const graphEditorViewport = getGraphEditorViewport(options);

  const yBounds = getGraphEditorYBounds({
    length,
    timelines,
    viewBounds,
  });

  const normalToViewport = createNormalToViewportFn({
    yBounds,
    viewBounds,
    length,
    timelines,
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
