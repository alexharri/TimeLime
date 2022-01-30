import { CANVAS_END_START_BUFFER, ZOOM_FAC } from "~/core/constants";
import { requestAction } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { capToRange } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent } from "~/types/commonTypes";

interface Options {
  e: SomeMouseEvent;
  type: "zoom_out" | "zoom_in";
}

export function onZoom(actionOptions: ActionOptions, options: Options) {
  const { e, type } = options;

  requestAction({ userActionOptions: actionOptions }, (params) => {
    const { view } = params;
    const { viewport, viewBounds } = view.state;

    const mousePos = Vec2.fromEvent(e)
      .subX(viewport.left)
      .subX(CANVAS_END_START_BUFFER);
    const t = mousePos.x / (viewport.width - CANVAS_END_START_BUFFER * 2);

    let newBounds: [number, number];

    if (type === "zoom_out") {
      const add = Math.abs(viewBounds[0] - viewBounds[1]) * ZOOM_FAC * 2;
      newBounds = [
        capToRange(0, 1, viewBounds[0] - add * t),
        capToRange(0, 1, viewBounds[1] + add * (1 - t)),
      ];
    } else {
      const remove = Math.abs(viewBounds[0] - viewBounds[1]) * ZOOM_FAC;
      newBounds = [
        viewBounds[0] + remove * t,
        viewBounds[1] - remove * (1 - t),
      ];
    }

    view.dispatch((actions) => actions.setFields({ viewBounds: newBounds }));

    params.submit({ name: "Zoom" });
  });
}
