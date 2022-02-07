import { VIEW_BOUNDS_HANDLE_WIDTH } from "~/core/constants";
import { startPanActionYBoundsAnimation } from "~/core/handlers/pan/panAnimation";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { base64Cursors } from "~/core/utils/cursor/base64Cursors";
import { Vec2 } from "~/core/utils/math/Vec2";
import { shiftViewBoundsByT } from "~/core/utils/viewUtils";
import { SomeMouseEvent, ViewBounds, YBounds } from "~/types/commonTypes";

// This may be converted to a configuration option in the future.
const ANIMATE_Y_BOUNDS_ON_PAN = true;

interface Options {
  e: SomeMouseEvent;
}

export function onPanViewBounds(actionOptions: ActionOptions, options: Options) {
  const { e } = options;

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const { viewBounds, viewport, length } = actionOptions.initialState.view;
  const { timelines } = actionOptions.initialState.primary;

  const getMousePositionT = (viewportMousePosition: Vec2) => {
    const w = viewport.width - VIEW_BOUNDS_HANDLE_WIDTH * 2;
    return viewportMousePosition.subX(VIEW_BOUNDS_HANDLE_WIDTH).x / w;
  };

  const getYBounds = (viewBounds: ViewBounds): YBounds =>
    getGraphEditorYBounds({ length, timelines, viewBounds });

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
      const cursor = base64Cursors.grabbing;
      params.ephemeral.dispatch((actions) => actions.setFields({ cursor }));
    },
    mouseMove: (params, { mousePosition, initialMousePosition }) => {
      const { view } = params;

      const initialT = getMousePositionT(initialMousePosition.viewport);
      const t = getMousePositionT(mousePosition.viewport);
      const tChange = t - initialT;

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
      params.submitView();
    },
  });
}
