import { TIMELINE_CP_TX_MAX, TIMELINE_CP_TX_MIN } from "~/core/constants";
import { capToRange, getDistance, lerp } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import {
  ControlPointShift,
  Timeline,
  TimelineKeyframe,
  TimelineKeyframeControlPoint,
  TimelineSelection,
} from "~/types/timelineTypes";

interface Options {
  timeline: Timeline;
  timelineSelection?: TimelineSelection;
  controlPointShift: ControlPointShift;
}

export const applyControlPointShift = (options: Options): Timeline => {
  const { timeline, timelineSelection, controlPointShift } = options;

  if (!timelineSelection) {
    return timeline;
  }

  const { shiftVector, distanceBetweenKeyframes, direction, yFac, shiftDown } = controlPointShift;

  const keyframes = timeline.keyframes.map<TimelineKeyframe>((k, i) => {
    if (!timelineSelection.keyframes[k.id]) {
      return k;
    }

    const computeCp = (
      i0: number,
      i1: number,
      cp: TimelineKeyframeControlPoint,
    ): TimelineKeyframeControlPoint => {
      const indexDifference = timeline.keyframes[i0].index - timeline.keyframes[i1].index;

      const indexShift = shiftVector.x * (distanceBetweenKeyframes / indexDifference);

      // This may exceed the bounds [0, 1] since the index difference between the
      // reference keyframes (the keyframes around the clicked control point) may
      // be different than the index difference between the current keyframes.
      const txShift = indexShift / distanceBetweenKeyframes;

      const currentValue = cp.value * (indexDifference / cp.relativeToDistance);

      return {
        relativeToDistance: indexDifference,
        tx: capToRange(TIMELINE_CP_TX_MIN, TIMELINE_CP_TX_MAX, cp.tx + txShift),
        value: shiftDown ? 0 : currentValue + shiftVector.y,
      };
    };

    if (direction === "left") {
      if (!timeline.keyframes[i - 1] || !k.controlPointLeft) {
        return k;
      }

      const reflect = k.reflectControlPoints && k.controlPointRight && timeline.keyframes[i + 1];

      const cpl = computeCp(i, i - 1, k.controlPointLeft);
      let cpr: TimelineKeyframeControlPoint | null;

      const oldCpr = k.controlPointRight!;

      if (reflect) {
        const k0 = timeline.keyframes[i - 1];
        const k1 = timeline.keyframes[i];
        const k2 = timeline.keyframes[i + 1];

        const cplPos = Vec2.new(lerp(k0.index, k1.index, cpl.tx), k.value + cpl.value);
        const cprPos = Vec2.new(lerp(k1.index, k2.index, oldCpr.tx), k.value + oldCpr.value);

        const kPos = Vec2.new(k1.index, k1.value);
        const lDist = getDistance(kPos.scaleX(yFac), cplPos.scaleX(yFac));
        const rDist = getDistance(kPos.scaleX(yFac), cprPos.scaleX(yFac));

        const cprPosNew = cplPos.scale(-1, kPos).scale(rDist / lDist, kPos);

        cpr = {
          relativeToDistance: k2.index - k1.index,
          tx: capToRange(
            TIMELINE_CP_TX_MIN,
            TIMELINE_CP_TX_MAX,
            (cprPosNew.x - k1.index) / (k2.index - k1.index),
          ),
          value: cprPosNew.y - k1.value,
        };
      } else {
        cpr = k.controlPointRight;
      }

      return {
        ...k,
        controlPointLeft: cpl,
        controlPointRight: cpr,
      };
    } else {
      if (!timeline.keyframes[i + 1] || !k.controlPointRight) {
        return k;
      }

      const reflect = k.reflectControlPoints && k.controlPointLeft && timeline.keyframes[i - 1];

      const cpr = computeCp(i + 1, i, k.controlPointRight);
      let cpl: TimelineKeyframeControlPoint | null;

      const oldCpl = k.controlPointLeft!;

      if (reflect) {
        const k0 = timeline.keyframes[i - 1];
        const k1 = timeline.keyframes[i];
        const k2 = timeline.keyframes[i + 1];

        const cplPos = Vec2.new(lerp(k0.index, k1.index, oldCpl.tx), k.value + oldCpl.value);
        const cprPos = Vec2.new(lerp(k1.index, k2.index, cpr.tx), k.value + cpr.value);

        const kPos = Vec2.new(k1.index, k1.value);
        const lDist = getDistance(kPos.scaleX(yFac), cplPos.scaleX(yFac));
        const rDist = getDistance(kPos.scaleX(yFac), cprPos.scaleX(yFac));

        const cplPosNew = cprPos.scale(-1, kPos).scale(lDist / rDist, kPos);

        cpl = {
          relativeToDistance: k1.index - k0.index,
          tx: capToRange(
            TIMELINE_CP_TX_MIN,
            TIMELINE_CP_TX_MAX,
            (cplPosNew.x - k0.index) / (k1.index - k0.index),
          ),
          value: cplPosNew.y - k1.value,
        };
      } else {
        cpl = k.controlPointLeft;
      }

      return {
        ...k,
        controlPointRight: cpr,
        controlPointLeft: cpl,
      };
    }
  });

  return { ...timeline, keyframes };
};
