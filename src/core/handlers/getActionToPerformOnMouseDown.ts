import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { createGlobalToNormalFn as createGlobalToNormalFn } from "~/core/utils/coords/globalToNormal";
import { createNormalToViewportFn } from "~/core/utils/coords/normalToViewport";
import { getGraphEditorTargetObject } from "~/core/utils/getGraphEditorTargetObject";
import { Vec2 } from "~/core/utils/math/Vec2";
import {
  MousePosition,
  Rect,
  SomeMouseEvent,
  ViewBounds,
} from "~/types/commonTypes";
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
    };

interface ActionToPerformOptions {
  e: SomeMouseEvent;
  timelines: TimelineMap;
  viewport: Rect;
  length: number;

  /** @default [0, 1] */
  viewBounds?: ViewBounds;
}

export const getActionToPerformOnMouseDown = (
  options: ActionToPerformOptions
): ActionToPerform => {
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
    timelines,
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

  const timelineList = Object.values(timelines);

  for (const timeline of timelineList) {
    const timelineId = timeline.id;

    const target = getGraphEditorTargetObject(
      timeline,
      mousePosition.viewport,
      normalToViewport
    );

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
