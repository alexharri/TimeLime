import { splitCubicBezier } from "~/core/utils/math/bezier";
import { findBezierXIntersectionT } from "~/core/utils/math/findBezierIntersection";
import { CubicBezier, Line } from "~/types/commonTypes";

const isFlatBezier = (bezier: CubicBezier) => {
  const y = bezier[0].y;
  for (let i = 1; i < bezier.length; i++) {
    if (y !== bezier[i].y) {
      return false;
    }
  }
  return true;
};

export const splitTimelineCurve = <T extends Line | CubicBezier>(
  curve: T,
  index: number
): [T, T] => {
  if (curve.length === 2) {
    const t = (index - curve[0].x) / (curve[1].x - curve[0].x);
    const mid = curve[0].lerp(curve[1], t);
    return [[curve[0], mid] as T, [mid, curve[1]] as T];
  }

  const bezier = curve as CubicBezier;

  if (isFlatBezier(bezier)) {
    return splitCubicBezier(bezier, 0.5) as [T, T];
  }

  const splitT = findBezierXIntersectionT(bezier, index);

  const [a, b] = splitCubicBezier(bezier, splitT);

  return [a as T, b as T];
};
