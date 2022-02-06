import { requestAction } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { Vec2 } from "~/core/utils/math/Vec2";

interface Options {
  e: WheelEvent;
}

export function onWheelZoom(actionOptions: ActionOptions, options: Options) {
  const { e } = options;
  const { deltaY } = e;

  const speed = Math.min(1, Math.abs(e.deltaY) / 14);
  const direction = deltaY > 0 ? 1 : -1;
  const fac = 1 + speed * 0.3 * direction;

  const { viewBounds, viewport, allowExceedViewBounds } = actionOptions.initialState.view;

  const mousePos = Vec2.fromEvent(e).subX(viewport.left);
  const t = mousePos.x / viewport.width;

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
