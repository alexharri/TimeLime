import { CubicBezier } from "timelime/types";
import { bezierVecAtT } from "~core/utils/math/bezier";

export function findBezierXIntersectionT(bezier: CubicBezier, x: number): number {
  let low = 0;
  let high = 1;
  let t = -1;

  // Binary search to a close-enough t value.
  for (let i = 0; i < 20; i++) {
    t = (high + low) / 2;
    const vec = bezierVecAtT(bezier, t);

    if (vec.x > x) {
      high = t;
    } else {
      low = t;
    }
  }

  return t;
}
