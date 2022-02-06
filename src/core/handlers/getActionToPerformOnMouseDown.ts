import { isKeyDown } from "~/core/listener/keyboard";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { createGlobalToNormalFn as createGlobalToNormalFn } from "~/core/utils/coords/globalToNormal";
import { createNormalToViewportFn } from "~/core/utils/coords/normalToViewport";
import { getGraphEditorTargetObject } from "~/core/utils/getGraphEditorTargetObject";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getGraphEditorViewport } from "~/core/utils/viewportUtils";
import { MousePosition, Rect, SomeMouseEvent, ViewBounds } from "~/types/commonTypes";
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
    };

interface ActionToPerformOptions {
  e: SomeMouseEvent;
  timelines: TimelineMap;
  viewport: Rect;
  length: number;
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
}

export const getActionToPerformOnMouseDown = (options: ActionToPerformOptions): ActionToPerform => {
  const { e, timelines, viewBounds, length, viewport } = options;

  if (isKeyDown("Space")) {
    return { type: "pan" };
  }

  if (isKeyDown("Z")) {
    return { type: e.altKey ? "zoom_out" : "zoom_in" };
  }

  const globalMousePosition = Vec2.fromEvent(e);

  const graphEditorViewport = getGraphEditorViewport(options);

  const yBounds = getGraphEditorYBounds({
    length,
    timelines,
    viewBounds,
  });

  const globalToNormal = createGlobalToNormalFn({
    yBounds,
    length,
    viewBounds,
    viewport,
    graphEditorViewport,
    timelines,
  });

  const normalToViewport = createNormalToViewportFn({
    yBounds,
    viewBounds,
    length,
    timelines,
    graphEditorViewport,
  });

  const mousePosition: MousePosition = {
    global: globalMousePosition,
    viewport: globalMousePosition.subXY(viewport.left, viewport.top),
    normal: globalToNormal(globalMousePosition),
  };

  const timelineList = Object.values(timelines);

  for (const timeline of timelineList) {
    const timelineId = timeline.id;

    const target = getGraphEditorTargetObject(timeline, mousePosition.viewport, normalToViewport);

    switch (target.type) {
      case "keyframe": {
        if (e.altKey) {
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
