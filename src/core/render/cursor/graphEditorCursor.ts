import { isKeyDown } from "~/core/listener/keyboard";
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
}

export const getGraphEditorCursor = (options: Options): string => {
  const {
    viewportMousePosition,
    yBounds,
    length,
    viewBounds,
    timelines,
    viewport,
  } = options;
  const normalToViewport = createNormalToViewportFn({
    yBounds,
    viewBounds,
    length,
    timelines,
    viewport,
  });

  const timelineList = Object.values(timelines);

  for (const timeline of timelineList) {
    const target = getGraphEditorTargetObject(
      timeline,
      viewportMousePosition,
      normalToViewport
    );

    switch (target.type) {
      case "keyframe": {
        if (isKeyDown("Alt")) {
          return base64Cursors.convert_anchor;
        }

        return base64Cursors.selection_move;
      }

      case "control_point": {
        if (isKeyDown("Alt")) {
          return base64Cursors.convert_anchor;
        }

        return base64Cursors.selection_move;
      }
    }
  }

  return base64Cursors.selection;
};
