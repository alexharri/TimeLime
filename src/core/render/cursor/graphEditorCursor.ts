import { mapMap } from "map-fns";
import { isKeyDown } from "~/core/listener/keyboard";
import { RenderState } from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { createNormalToViewportFn } from "~/core/utils/coords/normalToViewport";
import { base64Cursors } from "~/core/utils/cursor/base64Cursors";
import { getGraphEditorTargetObject } from "~/core/utils/getGraphEditorTargetObject";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, ViewBounds, YBounds } from "~/types/commonTypes";
import { TimelineMap } from "~/types/timelineTypes";

interface Options {
  yBounds?: YBounds;
  length: number;
  viewBounds: ViewBounds;
  viewport: Rect;
  viewportMousePosition: Vec2;
  timelines: TimelineMap;
  pan?: Vec2;
}

const getCursor = (options: Options): string => {
  if (isKeyDown("Space")) {
    return base64Cursors.grab;
  }

  if (isKeyDown("Z")) {
    return isKeyDown("Alt") ? base64Cursors.zoom_out : base64Cursors.zoom_in;
  }

  const { viewportMousePosition, yBounds, length, viewBounds, timelines, viewport, pan } = options;
  const normalToViewport = createNormalToViewportFn({
    yBounds,
    viewBounds,
    length,
    timelines,
    viewport,
    pan,
  });

  const timelineList = Object.values(timelines);

  for (const timeline of timelineList) {
    const target = getGraphEditorTargetObject(timeline, viewportMousePosition, normalToViewport);

    switch (target.type) {
      case "keyframe": {
        if (isKeyDown("Alt")) {
          return base64Cursors.convert_anchor;
        }

        return base64Cursors.selection_move;
      }

      case "control_point": {
        if (isKeyDown("Alt")) {
          if (target.keyframe.reflectControlPoints) {
            return base64Cursors.convert_anchor_no_reflect;
          }

          return base64Cursors.convert_anchor_reflect;
        }

        return base64Cursors.selection_move;
      }
    }
  }

  return base64Cursors.selection;
};

export const getGraphEditorCursor = (globalMousePosition: Vec2, renderState: RenderState) => {
  const { primary, selection, view, ephemeral } = renderState;

  if (ephemeral.cursor) {
    // The action is setting the cursor which we should be using.
    return ephemeral.cursor;
  }

  let { timelines } = primary;
  const { viewBounds, length, viewport } = view;
  const { yBounds, pan, keyframeShift } = ephemeral;

  if (keyframeShift) {
    timelines = mapMap(timelines, (timeline) =>
      applyTimelineKeyframeShift({
        timeline,
        timelineSelection: selection[timeline.id],
        keyframeShift,
      }),
    );
  }

  const viewportMousePosition = globalMousePosition.subXY(viewport.left, viewport.top);

  const cursor = getCursor({
    timelines,
    length,
    viewBounds,
    viewport,
    viewportMousePosition,
    yBounds,
    pan,
  });
  return cursor;
};
