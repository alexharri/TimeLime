import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { RequestActionParams } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent, ViewBounds, YBounds } from "~/types/commonTypes";

// Describes the maximum rate of change.
//
// 0.7 is near-instant, 0.1 is very slow.
const MAX_SPEED = 0.23;

// The lower this value is, the slower the speed ramps up from 0.
const START_SPEED_FAC = 0.0002;

// The ramp-up is proportional to (yUpper - yLower).
//
// This value describes how fast the ramp-up changes when the value
// of (yUpper - yLower) changes.
const RAMP_UP_CHANGE = 0.05;

interface Options {
  e: SomeMouseEvent;
}

export function onPan(actionOptions: ActionOptions, options: Options) {
  const { e } = options;

  const globalToNormal = createGlobalToNormalFnFromActionOptions(actionOptions);

  const { viewBounds, length, allowExceedViewBounds } =
    actionOptions.initialState.view;
  const { timelines } = actionOptions.initialState.primary;

  const getYBounds = (viewBounds: ViewBounds): YBounds => {
    return getGraphEditorYBounds({
      length,
      timelines,
      viewBounds,
    });
  };

  let currYBounds = getYBounds(viewBounds);
  let [yUpper, yLower] = currYBounds;

  let dir_up = 1;
  let dir_down = 1;
  let mom_up = 0;
  let mom_down = 0;

  let lastMin = (yUpper - yLower) * START_SPEED_FAC;

  function tick(params: RequestActionParams) {
    if (!params.done) {
      requestAnimationFrame(() => tick(params));
    }

    let hasRun = false;

    if (
      Math.abs(currYBounds[0] - yUpper) > 0.000001 ||
      Math.abs(currYBounds[1] - yLower) > 0.000001 ||
      // We run into issues with jumping if this does not run once before
      // a big jump in the value of `currYBounds`
      !hasRun
    ) {
      hasRun = true;
      lastMin = lerp(
        lastMin,
        (yUpper - yLower) * START_SPEED_FAC,
        RAMP_UP_CHANGE
      );

      const next_mom_up_real = lerp(yUpper, currYBounds[0], MAX_SPEED) - yUpper;
      const next_mom_down_real =
        lerp(yLower, currYBounds[1], MAX_SPEED) - yLower;

      const next_mom_up_abs = Math.abs(next_mom_up_real);
      const next_mom_down_abs = Math.abs(next_mom_down_real);

      const next_dir_up = next_mom_up_real >= 0 ? 1 : -1;
      const next_dir_down = next_mom_down_real >= 0 ? 1 : -1;

      if (dir_up !== next_dir_up) {
        mom_up = 0;
      }
      if (dir_down !== next_dir_down) {
        mom_down = 0;
      }

      dir_up = next_dir_up;
      dir_down = next_dir_down;

      mom_up = Math.min(next_mom_up_abs, Math.max(mom_up, lastMin) * 2);
      mom_down = Math.min(next_mom_down_abs, Math.max(mom_down, lastMin) * 2);

      yUpper += mom_up * dir_up;
      yLower += mom_down * dir_down;

      params.ephemeral.dispatch((actions) =>
        actions.setFields({ yBounds: [yUpper, yLower] })
      );
    }
  }

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,
    beforeMove: (params) => {
      tick(params);
    },
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

      currYBounds = getYBounds(newBounds);
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
