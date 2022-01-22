import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { createGlobalToNormalFunction as createGlobalToNormalFn } from "~/core/utils/coords/globalToNormal";
import { createNormalToViewportFn } from "~/core/utils/coords/normalToViewport";
import { getGraphEditorTimelineTargetObject } from "~/core/utils/getGraphEditorTargetObject";
import { Vec2 } from "~/core/utils/math/Vec2";
import {
  MousePosition,
  Rect,
  SomeMouseEvent,
  ViewBounds,
} from "~/types/commonTypes";
import { Timeline, TimelineKeyframe } from "~/types/timelineTypes";

type MouseDownResult =
  | {
      type: "alt_mousedown_keyframe";
      keyframe: TimelineKeyframe;
    }
  | {
      type: "mousedown_keyframe";
      keyframe: TimelineKeyframe;
    }
  | {
      type: "mousedown_control_point";
      keyframe: TimelineKeyframe;
      which: "left" | "right";
    }
  | {
      type: "mousedown_empty";
    };

interface ActionToPerformOptions {
  e: SomeMouseEvent;
  timelines: Timeline[];
  viewport: Rect;
  length: number;

  /** @default [0, 1] */
  viewBounds?: ViewBounds;
}

export const getActionToPerformOnMouseDown = (
  options: ActionToPerformOptions
): MouseDownResult => {
  const { e, viewport, timelines, viewBounds = [0, 1], length } = options;

  const globalMousePosition = Vec2.fromEvent(e);

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
  });
  const normalToViewport = createNormalToViewportFn({
    yBounds,
    viewBounds,
    length,
    timelines,
    viewport,
  });

  const mousePosition: MousePosition = {
    global: globalMousePosition,
    viewport: globalMousePosition.subXY(viewport.left, viewport.top),
    normal: globalToNormal(globalMousePosition),
  };

  for (const timeline of timelines) {
    const target = getGraphEditorTimelineTargetObject(
      timeline,
      mousePosition.viewport,
      normalToViewport
    );

    switch (target.type) {
      case "keyframe": {
        if (e.altKey) {
          return { type: "alt_mousedown_keyframe", keyframe: target.keyframe };
        }
        return { type: "mousedown_keyframe", keyframe: target.keyframe };
      }
      case "control_point": {
        return {
          type: "mousedown_control_point",
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
