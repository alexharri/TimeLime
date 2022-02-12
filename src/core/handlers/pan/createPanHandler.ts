import { startPanActionYBoundsAnimation } from "~/core/handlers/pan/panAnimation";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions, ViewState } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { base64Cursors } from "~/core/utils/cursor/base64Cursors";
import { MousePosition, Rect, SomeMouseEvent, ViewBounds, YBounds } from "~/types/commonTypes";

// This may be converted to a configuration option in the future.
const ANIMATE_Y_BOUNDS_ON_PAN = true;

interface Options {
  e: SomeMouseEvent;
}

interface GetNextViewBoundsOptions {
  viewport: Rect;
  viewState: ViewState;
  mousePosition: MousePosition;
  initialMousePosition: MousePosition;
}

interface CreateOptions {
  cursor?: string;
  getNextViewBounds: (options: GetNextViewBoundsOptions) => ViewBounds;
}

export function createPanHandler(createOptions: CreateOptions) {
  return function onPan(actionOptions: ActionOptions, options: Options) {
    const { e } = options;

    const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

    const initialViewState = actionOptions.initialState.view;
    const { viewBounds, viewport, length } = initialViewState;
    const { timelines } = actionOptions.initialState.primary;
    const timelineSelectionState = actionOptions.initialState.selection;

    const getYBounds = (viewBounds: ViewBounds): YBounds =>
      getGraphEditorYBounds({ length, timelines, timelineSelectionState, viewBounds });

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
        const cursor = createOptions.cursor || base64Cursors.grabbing;
        params.ephemeral.dispatch((actions) => actions.setFields({ cursor }));
      },
      mouseMove: (params, { mousePosition, initialMousePosition }) => {
        const { view } = params;

        const viewBounds = createOptions.getNextViewBounds({
          viewState: initialViewState,
          viewport,
          initialMousePosition,
          mousePosition,
        });

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
  };
}
