import { RequestActionParams } from "~/core/state/requestAction";
import { lerp } from "~/core/utils/math/math";
import { YBounds } from "~/types/commonTypes";

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

interface YBoundsAnimationReference {
  /**
   * The animation will continuously be moving to the newest value of `yBounds`.
   *
   * This value is expected to be constantly changing.
   */
  yBounds: YBounds;
}

export function startPanActionYBoundsAnimation(
  params: RequestActionParams,
  yBoundsAnimationReference: YBoundsAnimationReference
) {
  let [yUpper, yLower] = yBoundsAnimationReference.yBounds;

  // Instead of dealing with negative values, we store the absolute momentum
  // and the direction of that momentum separately. This makes the math easier
  // to think about.
  let momentumUpper = 0;
  let momentumLower = 0;
  let directionUpper = 1;
  let directionLower = 1;

  let hasRun = false;

  function tick(params: RequestActionParams) {
    if (params.done) {
      return;
    }

    requestAnimationFrame(() => tick(params));

    const run =
      // We run into issues with jumping if the tick does not run once before
      // a big jump in the value of `actualYBounds`.
      !hasRun ||
      // If the values are close enough, we don't need to keep updating.
      Math.abs(yBoundsAnimationReference.yBounds[0] - yUpper) > 0.000001 ||
      Math.abs(yBoundsAnimationReference.yBounds[1] - yLower) > 0.000001;

    if (!run) {
      return;
    }

    hasRun = true;

    // By "real", I mean that the value may be negative.
    const nextMomentumUpperReal =
      lerp(yUpper, yBoundsAnimationReference.yBounds[0], MAX_SPEED) - yUpper;
    const nextMomentumLowerReal =
      lerp(yLower, yBoundsAnimationReference.yBounds[1], MAX_SPEED) - yLower;

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
  tick(params);
}
