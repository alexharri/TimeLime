import { onAltMousedownKeyframe } from "~/core/handlers/altMousedownKeyframe";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { onMousedownControlPoint } from "~/core/handlers/mousedownControlPoint";
import { onMousedownEmpty } from "~/core/handlers/mousedownEmpty";
import { onMousedownKeyframe } from "~/core/handlers/mousedownKeyframe";
import {
  onMoveViewBoundsEdgeLeft,
  onMoveViewBoundsEdgeRight,
} from "~/core/handlers/pan/moveViewBoundsEdge";
import { onPan } from "~/core/handlers/pan/pan";
import { onPanViewBounds } from "~/core/handlers/pan/panViewBounds";
import { onZoom } from "~/core/handlers/zoom/zoom";
import { ActionOptions, TrackedState } from "~/core/state/stateTypes";
import { Vec2 } from "~/core/utils/math/Vec2";

interface Options {
  el: HTMLElement;
  getState: () => TrackedState;
  requestAction: (callback: (actionOptions: ActionOptions) => void) => void;
}

export function attachHandlers(options: Options): { detach: () => void } {
  const { el, getState, requestAction } = options;

  const onMouseDown = (e: MouseEvent) => {
    const { primary, view } = getState();

    const { timelines } = primary;
    const { length, viewport, viewBounds, viewBoundsHeight } = view;

    const actionToPerform = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.fromEvent(e),
      length,
      timelines,
      viewBounds,
      viewBoundsHeight,
      viewport,
    });

    console.log(actionToPerform);

    switch (actionToPerform.type) {
      case "mousedown_empty":
        requestAction((actionOptions) =>
          onMousedownEmpty(actionOptions, { e, ...actionToPerform }),
        );
        break;
      case "mousedown_keyframe":
        requestAction((actionOptions) =>
          onMousedownKeyframe(actionOptions, { e, ...actionToPerform }),
        );
        break;

      case "alt_mousedown_keyframe":
        requestAction((actionOptions) =>
          onAltMousedownKeyframe(actionOptions, { e, ...actionToPerform }),
        );
        break;

      case "mousedown_control_point":
        requestAction((actionOptions) =>
          onMousedownControlPoint(actionOptions, { e, ...actionToPerform }),
        );
        break;

      case "pan":
        requestAction((actionOptions) => onPan(actionOptions, { e }));
        break;

      case "zoom_out":
      case "zoom_in":
        requestAction((actionOptions) => onZoom(actionOptions, { ...actionToPerform, e }));
        break;

      case "pan_view_bounds": {
        requestAction((actionOptions) => onPanViewBounds(actionOptions, { e }));
        break;
      }
      case "mousedown_view_bounds_handle": {
        if (actionToPerform.which === "left") {
          requestAction((actionOptions) => onMoveViewBoundsEdgeLeft(actionOptions, { e }));
        } else {
          requestAction((actionOptions) => onMoveViewBoundsEdgeRight(actionOptions, { e }));
        }
        break;
      }
    }
  };

  el.addEventListener("mousedown", onMouseDown);

  function detach() {
    el.removeEventListener("mousedown", onMouseDown);
  }

  return { detach };
}
