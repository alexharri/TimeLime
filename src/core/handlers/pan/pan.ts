import { startPanActionYBoundsAnimation } from "~/core/handlers/pan/panAnimation";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { shiftViewBoundsByT } from "~/core/utils/viewUtils";
import { SomeMouseEvent, ViewBounds, YBounds } from "~/types/commonTypes";

// This may be converted to a configuration option in the future.
const ANIMATE_Y_BOUNDS_ON_PAN = true;

interface Options {
  e: SomeMouseEvent;
}

export function onPan(actionOptions: ActionOptions, options: Options) {
  const { e } = options;

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const { viewBounds, length } = actionOptions.initialState.view;
  const { timelines } = actionOptions.initialState.primary;

  const getYBounds = (viewBounds: ViewBounds): YBounds => {
    return getGraphEditorYBounds({
      length,
      timelines,
      viewBounds,
    });
  };

  const initialYBounds = getYBounds(viewBounds);

  const yBoundsAnimationReference = {
    yBounds: initialYBounds,
  };

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,
    beforeMove: (params) => {
      if (ANIMATE_Y_BOUNDS_ON_PAN) {
        startPanActionYBoundsAnimation(params, yBoundsAnimationReference);
      }
    },
    mouseMove: (params, { mousePosition }) => {
      const { view } = params;

      const initialMousePosition = Vec2.fromEvent(e);
      const initialNormalPosition = globalToNormal(initialMousePosition);
      let initialT = initialNormalPosition.x / length;

      const globalMousePosition = mousePosition.global;
      const pos = globalToNormal(globalMousePosition);

      const t = pos.x / length;
      const tChange = (t - initialT) * -1;

      const viewState = actionOptions.initialState.view;
      const viewBounds = shiftViewBoundsByT(viewState, tChange);

      view.dispatch((actions) => actions.setFields({ viewBounds }));

      if (ANIMATE_Y_BOUNDS_ON_PAN) {
        // Update the value of yBounds so that the animation can follow it.
        yBoundsAnimationReference.yBounds = getYBounds(viewBounds);
      }
    },
    mouseUp: (params, { hasMoved }) => {
      if (!hasMoved) {
        params.cancel();
        return;
      }

      params.submit({ name: "Pan" });
    },
  });
}
