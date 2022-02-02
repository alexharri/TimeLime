import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { mouseDownMoveAction } from "~/core/state/mouseDownMoveAction";
import { RequestActionParams } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { createGlobalToNormalFnFromActionOptions } from "~/core/utils/coords/globalToNormal";
import { lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent, ViewBounds, YBounds } from "~/types/commonTypes";

// This may be converted to a configuration option in the future.
const ANIMATE_Y_BOUNDS_ON_PAN = true;

// Every tick, the momentum wants to increase to the maximum speed
// allowed (defined by `MAX_SPEED`). The maximum possible momentum
// is computed like so:
//
//    ```tsx
//    momentum = lerp(currentValue, targetValue, MAX_SPEED) - currentValue
//    ```
//
// However, this creates a steep ease-out curve (see https://easings.net/).
//
// We do not want to hit the maximum speed instantly from 0. Instead,
// we add a bound where the next momentum must be lower than the current
// momentum multiplied by a constant, which is this constant.
//
// So the next momentum is computed like so:
//
//    ```tsx
//    const preferredMomentum = lerp(currentValue, targetValue, MAX_SPEED) - currentValue
//
//    momentum = Math.min(preferredMomentum, momentum * MAX_SPEED_INCREASE_PER_TICK)
//    ```
//
// Since the bound is a multiple, it creates an exponential ramp-up, which
// is desirable.
//
const MAX_SPEED_INCREASE_PER_TICK = 2.5;

// Describes the maximum rate of change.
//
// 0.7 is near-instant, 0.1 is very slow.
const MAX_SPEED = 0.18;

// When the current momentum is 0, we cannot find the next maximum momentum by
// multiplying it with a constant since `0 * N = 0` (see MAX_SPEED_INCREASE_PER_TICK).
//
// This value describes the "mimimum momentum" for the purposes of computing
// an upper bound for the next momentum.
//
// The lower this value is, the slower the speed ramps up from 0.
const START_SPEED_FAC = 0.0002;

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

  // Instead of dealing with negative values, we store the absolute momentum
  // and the direction of that momentum separately. This makes the math easier
  // to think about.
  let momentumUpper = 0;
  let momentumLower = 0;
  let directionUpper = 1;
  let directionLower = 1;

  // Every tick, the maximum speed is the previous speed
  let hasRun = false;

  function tick(params: RequestActionParams) {
    if (params.done) {
      return;
    }

    requestAnimationFrame(() => tick(params));

    const run =
      // We run into issues with jumping if this does not run once before
      // a big jump in the value of `currYBounds`
      !hasRun ||
      // If the values are close enough, we don't need to keep updating.
      Math.abs(currYBounds[0] - yUpper) > 0.000001 ||
      Math.abs(currYBounds[1] - yLower) > 0.000001;

    if (!run) {
      return;
    }

    hasRun = true;

    // By "real", I mean that the value may be negative.
    const nextMomentumUpperReal =
      lerp(yUpper, currYBounds[0], MAX_SPEED) - yUpper;
    const nextMomentumLowerReal =
      lerp(yLower, currYBounds[1], MAX_SPEED) - yLower;

    const nextMomentumUpperAbs = Math.abs(nextMomentumUpperReal);
    const nextMomentumLowerAbs = Math.abs(nextMomentumLowerReal);

    const nextDirectionUpper = nextMomentumUpperReal >= 0 ? 1 : -1;
    const nextDirectionLower = nextMomentumLowerReal >= 0 ? 1 : -1;

    // If the direction that we're moving in changes, reset the momentum.
    //
    // If instead we were to slowly reduce the momentum then reverse it, the
    // animation might appear more smooth. However, we want it to feel snappy.
    if (directionUpper !== nextDirectionUpper) {
      momentumUpper = 0;
    }
    if (directionLower !== nextDirectionLower) {
      momentumLower = 0;
    }

    directionUpper = nextDirectionUpper;
    directionLower = nextDirectionLower;

    // Prevent multiplying by 0. See comment on `START_SPEED_FAC`.
    const minMomentum = (yUpper - yLower) * START_SPEED_FAC;
    const getCurrentMomentum = (momentum: number) =>
      Math.max(momentum, minMomentum) * MAX_SPEED_INCREASE_PER_TICK;

    momentumUpper = Math.min(
      nextMomentumUpperAbs,
      getCurrentMomentum(momentumUpper)
    );
    momentumLower = Math.min(
      nextMomentumLowerAbs,
      getCurrentMomentum(momentumLower)
    );

    yUpper += momentumUpper * directionUpper;
    yLower += momentumLower * directionLower;

    params.ephemeral.dispatch((actions) =>
      actions.setFields({ yBounds: [yUpper, yLower] })
    );
  }

  mouseDownMoveAction({
    userActionOptions: actionOptions,
    e,
    globalToNormal,
    beforeMove: (params) => {
      if (ANIMATE_Y_BOUNDS_ON_PAN) {
        tick(params);
      }
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
