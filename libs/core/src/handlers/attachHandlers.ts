import { ActionOptions, TrackedState } from "timelime/types";
import { onAltMousedownKeyframe } from "~core/handlers/altMousedownKeyframe";
import { getActionToPerformOnMouseDown } from "~core/handlers/getActionToPerformOnMouseDown";
import { onMousedownControlPoint } from "~core/handlers/mousedownControlPoint";
import { onMousedownEmpty } from "~core/handlers/mousedownEmpty";
import { onMousedownKeyframe } from "~core/handlers/mousedownKeyframe";
import {
  onMoveViewBoundsEdgeLeft,
  onMoveViewBoundsEdgeRight,
} from "~core/handlers/pan/moveViewBoundsEdge";
import { onPan } from "~core/handlers/pan/pan";
import { onPanViewBounds } from "~core/handlers/pan/panViewBounds";
import { onWheelPan } from "~core/handlers/pan/wheelPan";
import { onScrub } from "~core/handlers/scrub";
import { onWheelZoom } from "~core/handlers/zoom/wheelZoom";
import { onZoom } from "~core/handlers/zoom/zoom";
import { Vec2 } from "~core/utils/math/Vec2";
import { parseWheelEvent } from "~core/utils/wheelEvent";

interface Options {
  el: HTMLElement;
  getState: () => TrackedState;
  getActionOptions: (callback: (actionOptions: ActionOptions) => void) => void;
}

export function attachHandlers(options: Options): { detach: () => void } {
  const { el, getState, getActionOptions } = options;

  const onMouseDown = (e: MouseEvent) => {
    const { primary, selection, view } = getState();

    const { timelines } = primary;
    const timelineSelectionState = selection;
    const { length, viewport, viewBounds, viewBoundsHeight, scrubberHeight } = view;

    const actionToPerform = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.fromEvent(e),
      length,
      timelines,
      timelineSelectionState,
      viewBounds,
      viewBoundsHeight,
      scrubberHeight,
      viewport,
    });

    switch (actionToPerform.type) {
      case "mousedown_empty":
        getActionOptions((actionOptions) =>
          onMousedownEmpty(actionOptions, { e, ...actionToPerform }),
        );
        break;
      case "mousedown_keyframe":
        getActionOptions((actionOptions) =>
          onMousedownKeyframe(actionOptions, { e, ...actionToPerform }),
        );
        break;

      case "alt_mousedown_keyframe":
        getActionOptions((actionOptions) =>
          onAltMousedownKeyframe(actionOptions, { e, ...actionToPerform }),
        );
        break;

      case "mousedown_control_point":
        getActionOptions((actionOptions) =>
          onMousedownControlPoint(actionOptions, { e, ...actionToPerform }),
        );
        break;

      case "pan":
        getActionOptions((actionOptions) => onPan(actionOptions, { e }));
        break;

      case "zoom_out":
      case "zoom_in":
        getActionOptions((actionOptions) => onZoom(actionOptions, { ...actionToPerform, e }));
        break;

      case "scrub":
        getActionOptions((actionOptions) => onScrub(actionOptions, { e }));
        break;

      case "pan_view_bounds": {
        getActionOptions((actionOptions) => onPanViewBounds(actionOptions, { e }));
        break;
      }
      case "mousedown_view_bounds_handle": {
        if (actionToPerform.which === "left") {
          getActionOptions((actionOptions) => onMoveViewBoundsEdgeLeft(actionOptions, { e }));
        } else {
          getActionOptions((actionOptions) => onMoveViewBoundsEdgeRight(actionOptions, { e }));
        }
        break;
      }
    }
  };

  const onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const parsed = parseWheelEvent(e);

    switch (parsed.type) {
      case "pinch_zoom":
        getActionOptions((actionOptions) => onWheelZoom(actionOptions, { e }));
        break;

      case "pan":
        getActionOptions((actionOptions) => onWheelPan(actionOptions, { e }));
        break;
    }
  };

  el.addEventListener("mousedown", onMouseDown);
  el.addEventListener("wheel", onWheel, { passive: false });

  function detach() {
    el.removeEventListener("mousedown", onMouseDown);
    el.removeEventListener("wheel", onWheel);
  }

  // Prevent mouse down + drag events from modifying current selection.
  el.style.userSelect = "none";

  return { detach };
}
