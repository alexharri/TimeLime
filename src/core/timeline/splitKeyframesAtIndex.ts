import { createKeyframeId } from "~/core/timeline/keyframeId";
import { controlPointAsVector } from "~/core/transform/controlPointVector";
import { partialToFullCubicBezier, splitCubicBezier } from "~/core/utils/math/bezier";
import { findBezierXIntersectionT } from "~/core/utils/math/findBezierIntersection";
import { capToRange, lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Curve } from "~/types/commonTypes";
import { Timeline, TimelineKeyframe } from "~/types/timelineTypes";

export function splitKeyframesAtIndex(
  timeline: Timeline,
  k0: TimelineKeyframe,
  k1: TimelineKeyframe,
  index: number,
): [TimelineKeyframe, TimelineKeyframe, TimelineKeyframe] {
  let curve: Curve;

  if (k0.controlPointRight && k1.controlPointLeft) {
    curve = [
      Vec2.new(k0.index, k0.value),
      controlPointAsVector("cp0", k0, k1)!,
      controlPointAsVector("cp1", k0, k1)!,
      Vec2.new(k1.index, k1.value),
    ];
  } else if (k0.controlPointRight || k1.controlPointLeft) {
    curve = partialToFullCubicBezier([
      Vec2.new(k0.index, k0.value),
      controlPointAsVector("cp0", k0, k1),
      controlPointAsVector("cp1", k0, k1),
      Vec2.new(k1.index, k1.value),
    ]);
  } else {
    curve = [Vec2.new(k0.index, k0.value), Vec2.new(k1.index, k1.value)];
  }

  if (curve.length === 2) {
    const t = (index - k0.index) / (k1.index - k0.index);
    const value = lerp(k0.value, k1.value, t);
    const k: TimelineKeyframe = {
      controlPointLeft: null,
      controlPointRight: null,
      id: createKeyframeId(timeline),
      index,
      reflectControlPoints: false,
      value,
    };
    return [k0, k, k1];
  }

  const t = findBezierXIntersectionT(curve, index);

  const [a, b] = splitCubicBezier(curve, t);

  return [
    {
      ...k0,
      controlPointRight: {
        relativeToDistance: index - k0.index,
        tx: capToRange(0, 1, 1 - (a[3].x - a[1].x) / (a[3].x - a[0].x)),
        value: a[1].y - a[0].y,
      },
    },
    {
      id: createKeyframeId(timeline),
      index,
      value: a[3].y,
      reflectControlPoints: true,
      controlPointLeft: {
        relativeToDistance: index - k0.index,
        tx: capToRange(0, 1, 1 - (a[3].x - a[2].x) / (a[3].x - a[0].x)),
        value: a[2].y - a[3].y,
      },
      controlPointRight: {
        relativeToDistance: k1.index - index,
        tx: capToRange(0, 1, 1 - (b[3].x - b[1].x) / (b[3].x - b[0].x)),
        value: b[1].y - b[0].y,
      },
    },
    {
      ...k1,
      controlPointLeft: {
        relativeToDistance: k1.index - index,
        tx: capToRange(0, 1, 1 - (b[3].x - b[2].x) / (b[3].x - b[0].x)),
        value: b[2].y - b[3].y,
      },
    },
  ];
}
