import { Curve, TimelineKeyframe } from "timelime/types";
import { controlPointAsVector } from "~core/transform/controlPointVector";
import { partialToFullCubicBezier } from "~core/utils/math/bezier";
import { Vec2 } from "~core/utils/math/Vec2";

export const getCurveBetweenKeyframes = (k0: TimelineKeyframe, k1: TimelineKeyframe): Curve => {
  const p0 = Vec2.new(k0.index, k0.value);
  const p1 = controlPointAsVector("cp0", k0, k1);
  const p2 = controlPointAsVector("cp1", k0, k1);
  const p3 = Vec2.new(k1.index, k1.value);

  if (p1 && p2) {
    return [p0, p1, p2, p3];
  }

  if (p1 || p2) {
    return partialToFullCubicBezier([p0, p1, p2, p3]);
  }

  return [p0, p3];
};

export const keyframesToCurves = (keyframes: TimelineKeyframe[]): Curve[] => {
  const paths: Curve[] = [];

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const k0 = keyframes[i];
    const k1 = keyframes[i + 1];
    paths.push(getCurveBetweenKeyframes(k0, k1));
  }

  return paths;
};
