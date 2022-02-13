import { ActionOptions, MousePosition, SomeMouseEvent } from "timelime/types";
import { mouseDownMoveAction } from "~core/state/mouseDownMoveAction";
import { RequestActionParams } from "~core/state/requestAction";
import { createGlobalToNormalFnFromActionOptions } from "~core/utils/coords/globalToNormal";

interface Options {
  e: SomeMouseEvent;
}

export function onScrub(actionOptions: ActionOptions, options: Options) {
  const { e } = options;

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const setFrameIndex = (params: RequestActionParams, opts: { mousePosition: MousePosition }) => {
    const { view } = params;
    const frameIndex = Math.round(opts.mousePosition.normal.x);
    view.dispatch((actions) => actions.setFields({ frameIndex }));
  };

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,
    beforeMove: setFrameIndex,
    mouseMove: setFrameIndex,
    mouseUp: (params) => {
      params.submitView();
    },
  });
}
