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

export const splitTimelinePath = <T extends Line | CubicBezier>(
  path: T,
  index: number
): [T, T] => {
  if (path.length === 2) {
    const t = (index - path[0].x) / (path[1].x - path[0].x);
    const mid = path[0].lerp(path[1], t);
    return [[path[0], mid] as T, [mid, path[1]] as T];
  }

  const bezier = path as CubicBezier;

  if (isFlatBezier(bezier)) {
    return splitCubicBezier(bezier, 0.5) as [T, T];
  }

  const splitT = findBezierXIntersectionT(bezier, index);

  const [a, b] = splitCubicBezier(bezier, splitT);

  return [a as T, b as T];
};
