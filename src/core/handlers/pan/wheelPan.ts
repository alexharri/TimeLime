import { requestAction } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";

interface Options {
  e: WheelEvent;
}

export function onWheelPan(actionOptions: ActionOptions, options: Options) {
  const { e } = options;
  const { deltaX } = e;

  requestAction({ userActionOptions: actionOptions }, (params) => {
    const { view } = params;
    const { length, viewBounds, allowExceedViewBounds } = view.state;

    const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

    const [x0, x1] = [0, deltaX].map((x) => globalToNormal(Vec2.new(x, 0)).x);

    const t = x0 / length - x1 / length;
    const tChange = t * -1;

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

    params.submitView();
  });
}
