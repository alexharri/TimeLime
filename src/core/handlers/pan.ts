import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent } from "~/types/commonTypes";

interface Options {
  e: SomeMouseEvent;
}

export function onPan(actionOptions: ActionOptions, options: Options) {
  const { e } = options;

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const { viewBounds, length, allowExceedViewBounds } =
    actionOptions.initialState.view;

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,
    mouseMove: (params, { mousePosition }) => {
      const { view } = params;

      const initialMousePosition = Vec2.fromEvent(e);
      const initialNormalPosition = globalToNormal(initialMousePosition);
      let initialT = initialNormalPosition.x / length;

      const globalMousePosition = mousePosition.global;
      const pos = globalToNormal(globalMousePosition);

      const t = pos.x / length;

      const tChange = (t - initialT) * -1;

      const rightShiftMax = 1 - viewBounds[1];
      const leftShiftMax = -viewBounds[0];

      let newBounds = [viewBounds[0], viewBounds[1]] as [number, number];
      if (!allowExceedViewBounds && tChange > rightShiftMax) {
        newBounds[1] = 1;
        newBounds[0] += rightShiftMax;
      } else if (!allowExceedViewBounds && tChange < leftShiftMax) {
        newBounds[0] = 0;
        newBounds[1] += leftShiftMax;
      } else {
        newBounds[0] += tChange;
        newBounds[1] += tChange;
      }

      view.dispatch((actions) => actions.setFields({ viewBounds: newBounds }));
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
