import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { SomeMouseEvent } from "~/types/commonTypes";

interface Options {
  e: SomeMouseEvent;
}

export function onScrub(actionOptions: ActionOptions, options: Options) {
  const { e } = options;

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,

    beforeMove: (params, { mousePosition }) => {
      const { view } = params;
      const frameIndex = Math.round(mousePosition.normal.x);
      view.dispatch((actions) => actions.setFields({ frameIndex }));
    },
    mouseMove: (params, { mousePosition }) => {
      const { view } = params;
      const frameIndex = Math.round(mousePosition.normal.x);
      view.dispatch((actions) => actions.setFields({ frameIndex }));
    },
    mouseUp: (params) => {
      params.submitView();
    },
  });
}
