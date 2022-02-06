import { requestAction } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { capToRange, lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";

interface Options {
  e: WheelEvent;
  impact: number;
}

export function onWheelZoom(actionOptions: ActionOptions, options: Options) {
  const { e, impact } = options;
  const { deltaY } = e;

  const fac = lerp(1, -deltaY < 0 ? 1.15 : 0.85, capToRange(0, 2, impact));

  const { viewBounds, viewport, allowExceedViewBounds } = actionOptions.initialState.view;

  const mousePos = Vec2.fromEvent(e).subX(viewport.left);
  const t = mousePos.x / viewport.width;

  if (t < 0) {
    // User is pinch zooming on layer list. We just ignore this.
    return;
  }

  const remove = Math.abs(viewBounds[0] - viewBounds[1]) * (1 - fac);
  let newBounds: [number, number] = [viewBounds[0] + remove * t, viewBounds[1] - remove * (1 - t)];

  if (!allowExceedViewBounds) {
    if (newBounds[0] < 0 && newBounds[1] > 1) {
      newBounds = [0, 1];
    } else if (newBounds[0] < 0) {
      newBounds[1] = Math.min(1, newBounds[1] + Math.abs(newBounds[0]));
      newBounds[0] = 0;
    } else if (newBounds[1] > 1) {
      newBounds[0] = Math.max(0, newBounds[0] - (newBounds[1] - 1));
      newBounds[1] = 1;
    }
  }

  requestAction({ userActionOptions: actionOptions }, (params) => {
    params.view.dispatch((actions) => actions.setFields({ viewBounds: newBounds }));
    params.submitView();
  });
}
