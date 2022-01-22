import { partialToFullCubicBezier } from "~/core/utils/math/bezier";
import { lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Curve } from "~/types/commonTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

export const getControlPointAsVector = (
  whichControlPoint: "cp0" | "cp1",
  k0: TimelineKeyframe,
  k1: TimelineKeyframe
): Vec2 | null => {
  const k = whichControlPoint === "cp0" ? k0 : k1;
  const cp =
    whichControlPoint === "cp0" ? k.controlPointRight : k.controlPointLeft;

  if (!cp) {
    return null;
  }

  const t = (k1.index - k0.index) / cp.relativeToDistance;
  return Vec2.new(lerp(k0.index, k1.index, cp.tx), k.value + cp.value * t);
};

const getCurveBetweenKeyframes = (
  k0: TimelineKeyframe,
  k1: TimelineKeyframe
): Curve => {
  const p0 = Vec2.new(k0.index, k0.value);
  const p1 = getControlPointAsVector("cp0", k0, k1);
  const p2 = getControlPointAsVector("cp1", k0, k1);
  const p3 = Vec2.new(k1.index, k1.value);

  if (p1 && p2) {
    return [p0, p1, p2, p3];
  }

  if (p1 || p2) {
    return partialToFullCubicBezier([p0, p1, p2, p3]);
  }

  return [p0, p3];
};

export const convertTimelineKeyframesToCurves = (
  keyframes: TimelineKeyframe[]
): Curve[] => {
  const paths: Curve[] = [];

  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const k0 = keyframes[i];
    const k1 = keyframes[i + 1];
    paths.push(getCurveBetweenKeyframes(k0, k1));
  }

  return paths;
};
