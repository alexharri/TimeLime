import { Rect, RenderState, TimelineMap, ViewBounds } from "timelime/types";
import { getActionToPerformOnMouseDown } from "~core/handlers/getActionToPerformOnMouseDown";
import { isKeyDown } from "~core/listener/keyboard";
import { TimelineSelectionState } from "~core/state/timelineSelection/timelineSelectionReducer";
import { base64Cursors } from "~core/utils/cursor/base64Cursors";
import { Vec2 } from "~core/utils/math/Vec2";

interface Options {
  length: number;
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
  scrubberHeight: number;
  globalMousePosition: Vec2;
  timelines: TimelineMap;
  timelineSelectionState: TimelineSelectionState;
  viewport: Rect;
}

const getCursor = (options: Options): string => {
  const actionToPerform = getActionToPerformOnMouseDown(options);
  switch (actionToPerform.type) {
    case "alt_mousedown_keyframe":
      return base64Cursors.convert_anchor;
    case "mousedown_keyframe":
      return base64Cursors.selection_move;
    case "mousedown_control_point": {
      if (isKeyDown("Alt")) {
        return actionToPerform.keyframe.reflectControlPoints
          ? base64Cursors.convert_anchor_no_reflect
          : base64Cursors.convert_anchor_reflect;
      }
      return base64Cursors.selection_move;
    }
    case "mousedown_view_bounds_handle":
      return "ew-resize";
    case "pan":
      return base64Cursors.grab;
    case "pan_view_bounds":
      return base64Cursors.selection_move_horizontal;
    case "zoom_in":
      return base64Cursors.zoom_in;
    case "zoom_out":
      return base64Cursors.zoom_out;
    case "mousedown_empty":
      return base64Cursors.selection;
    default:
      return base64Cursors.selection;
  }
};

export const getGraphEditorCursor = (globalMousePosition: Vec2, renderState: RenderState) => {
  const { primary, selection, view, ephemeral } = renderState;

  if (ephemeral.cursor) {
    // The action is setting the cursor which we should be using.
    return ephemeral.cursor;
  }

  let { timelines } = primary;
  const timelineSelectionState = selection;
  const { viewBounds, viewBoundsHeight, scrubberHeight, length, viewport } = view;

  const cursor = getCursor({
    timelines,
    timelineSelectionState,
    length,
    viewBounds,
    viewBoundsHeight,
    scrubberHeight,
    globalMousePosition,
    viewport,
  });
  return cursor;
};
