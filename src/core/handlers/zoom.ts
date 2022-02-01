import { CANVAS_END_START_BUFFER, ZOOM_FAC } from "~/core/constants";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { requestAction } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { animate } from "~/core/utils/animate";
import { capToRange, lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent, ViewBounds, YBounds } from "~/types/commonTypes";

interface Options {
  e: SomeMouseEvent;
  type: "zoom_out" | "zoom_in";
}

export function onZoom(actionOptions: ActionOptions, options: Options) {
  const { e, type } = options;

  requestAction({ userActionOptions: actionOptions }, (params) => {
    const { primary, view, ephemeral } = params;
    const { viewport, viewBounds, allowExceedViewBounds, length } = view.state;

    const mousePos = Vec2.fromEvent(e)
      .subX(viewport.left)
      .subX(CANVAS_END_START_BUFFER);
    const t = mousePos.x / (viewport.width - CANVAS_END_START_BUFFER * 2);

    let nextViewBounds: [number, number];

    const LOW = allowExceedViewBounds ? -Infinity : 0;
    const HIGH = allowExceedViewBounds ? Infinity : 0;

    if (type === "zoom_out") {
      const add = Math.abs(viewBounds[0] - viewBounds[1]) * ZOOM_FAC * 2;
      nextViewBounds = [
        capToRange(LOW, HIGH, viewBounds[0] - add * t),
        capToRange(LOW, HIGH, viewBounds[1] + add * (1 - t)),
      ];
    } else {
      const remove = Math.abs(viewBounds[0] - viewBounds[1]) * ZOOM_FAC;
      nextViewBounds = [
        viewBounds[0] + remove * t,
        viewBounds[1] - remove * (1 - t),
      ];
    }

    const yBounds = getGraphEditorYBounds({
      length,
      timelines: primary.state.timelines,
      viewBounds,
    });
    const nextYBounds = getGraphEditorYBounds({
      length,
      timelines: primary.state.timelines,
      viewBounds: nextViewBounds,
    });

    animate({ duration: 150 }, (t) => {
      const currYBounds: YBounds = [
        lerp(yBounds[0], nextYBounds[0], t),
        lerp(yBounds[1], nextYBounds[1], t),
      ];
      const currViewBounds: ViewBounds = [
        lerp(viewBounds[0], nextViewBounds[0], t),
        lerp(viewBounds[1], nextViewBounds[1], t),
      ];
      ephemeral.dispatch((actions) =>
        actions.setFields({ yBounds: currYBounds })
      );
      view.dispatch((actions) =>
        actions.setFields({ viewBounds: currViewBounds })
      );
    }).then(() => params.submit({ name: "Zoom" }));
  });
}
