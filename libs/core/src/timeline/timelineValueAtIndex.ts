import Bezier from "bezier-easing";
import { Timeline } from "timelime/types";
import { getCurveBetweenKeyframes } from "~core/transform/keyframesToCurves";
import { bezierVecAtT } from "~core/utils/math/bezier";
import { findBezierXIntersectionT } from "~core/utils/math/findBezierIntersection";
import { lerp } from "~core/utils/math/math";

interface GetTimelineValueAtIndexOptions {
  timeline: Timeline;
  frameIndex: number;
}

export function getTimelineValueAtIndex(options: GetTimelineValueAtIndexOptions): number {
  const index = options.frameIndex;
  let timeline = options.timeline;

  const keyframes = timeline.keyframes;

  if (keyframes.length < 1) {
    throw new Error("Timeline must have at least one keyframe");
  }

  if (keyframes.length === 1 || keyframes[0].index > index) {
    return keyframes[0].value;
  }

  if (keyframes[keyframes.length - 1].index < index) {
    return keyframes[keyframes.length - 1].value;
  }

  for (let i = 0; i < keyframes.length; i += 1) {
    if (keyframes[i].index > index) {
      continue;
    }

    if (keyframes[i].index === index) {
      return keyframes[i].value;
    }

    if (index > keyframes[i + 1].index) {
      continue;
    }

    const k0 = keyframes[i];
    const k1 = keyframes[i + 1];

    const curve = getCurveBetweenKeyframes(k0, k1);
    const linearT = (index - k0.index) / (k1.index - k0.index);

    if (curve.length === 2) {
      return lerp(curve[0].y, curve[1].y, linearT);
    }

    const xDiff = curve[3].x - curve[0].x;
    const yDiff = curve[3].y - curve[0].y;

    if (yDiff === 0) {
      // The keyframes have the same value, we can't use Bezier to
      // get the Y value.
      //
      // Check if the bezier is entirely flat.
      let yMax = -Infinity;
      let yMin = Infinity;

      for (const p of curve) {
        if (yMax < p.y) {
          yMax = p.y;
        }
        if (yMin > p.y) {
          yMin = p.y;
        }
      }

      if (yMax === yMin) {
        // Bezier is flat, Y value of all control points is the same.
        return yMax;
      }

      // Find intersection with vertical line at index.
      const t = findBezierXIntersectionT(curve, index);
      return bezierVecAtT(curve, t).y;
    }

    const x1 = (curve[1].x - curve[0].x) / xDiff;
    const y1 = (curve[1].y - curve[0].y) / yDiff;
    const x2 = (curve[2].x - curve[0].x) / xDiff;
    const y2 = (curve[2].y - curve[0].y) / yDiff;

    return lerp(curve[0].y, curve[3].y, Bezier(x1, y1, x2, y2)(linearT));
  }

  return 0 as never;
}
