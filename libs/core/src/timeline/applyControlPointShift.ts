import {
  ControlPointShift,
  Timeline,
  TimelineKeyframe,
  TimelineKeyframeControlPoint,
  TimelineSelection,
} from "timelime/types";
import { TIMELINE_CP_TX_MAX, TIMELINE_CP_TX_MIN } from "~core/constants";
import { capToRange, getDistance, lerp } from "~core/utils/math/math";
import { Vec2 } from "~core/utils/math/Vec2";

const capTx = (tx: number) => capToRange(TIMELINE_CP_TX_MIN, TIMELINE_CP_TX_MAX, tx);

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

  const { shiftVector, distanceBetweenKeyframes, direction, yFac, shiftKeyDown } =
    controlPointShift;

  const keyframes = timeline.keyframes.map<TimelineKeyframe>((k, i) => {
    if (!timelineSelection.keyframes[k.id]) {
      return k;
    }

    const computeCp = (
      i0: number,
      i1: number,
      cp: TimelineKeyframeControlPoint,
    ): TimelineKeyframeControlPoint => {
      const relativeToDistance = timeline.keyframes[i0].index - timeline.keyframes[i1].index;

      const indexShift = shiftVector.x * (distanceBetweenKeyframes / relativeToDistance);

      // This may exceed the bounds [0, 1] since the index difference between the
      // reference keyframes (the keyframes around the clicked control point) may
      // be different than the index difference between the current keyframes.
      const txShift = indexShift / distanceBetweenKeyframes;
      const tx = capTx(cp.tx + txShift);

      const currentValue = cp.value * (relativeToDistance / cp.relativeToDistance);
      const value = shiftKeyDown ? 0 : currentValue + shiftVector.y;

      return { relativeToDistance, tx, value };
    };

    const k0 = timeline.keyframes[i - 1];
    const k1 = timeline.keyframes[i];
    const k2 = timeline.keyframes[i + 1];
    const kPos = Vec2.new(k1.index, k1.value);

    function reflectedRight(): TimelineKeyframeControlPoint {
      const cpl = computeCp(i, i - 1, k.controlPointLeft!);
      const oldCpr = k.controlPointRight!;

      const cplPos = Vec2.new(lerp(k0.index, k1.index, cpl.tx), k.value + cpl.value);
      const cprPos = Vec2.new(lerp(k1.index, k2.index, oldCpr.tx), k.value + oldCpr.value);

      const lDist = getDistance(kPos.scaleX(yFac), cplPos.scaleX(yFac));
      const rDist = getDistance(kPos.scaleX(yFac), cprPos.scaleX(yFac));

      const cprPosNew = cplPos.scale(-1, kPos).scale(rDist / lDist, kPos);

      const relativeToDistance = k2.index - k1.index;

      const cpIndexRelative = cprPosNew.x - k1.index;
      const tx = capTx(cpIndexRelative / relativeToDistance);

      const value = cprPosNew.y - k1.value;

      return { relativeToDistance, tx, value };
    }

    function reflectedLeft(): TimelineKeyframeControlPoint {
      const cpr = computeCp(i + 1, i, k.controlPointRight!);
      const oldCpl = k.controlPointLeft!;

      const cplPos = Vec2.new(lerp(k0.index, k1.index, oldCpl.tx), k.value + oldCpl.value);
      const cprPos = Vec2.new(lerp(k1.index, k2.index, cpr.tx), k.value + cpr.value);

      const lDist = getDistance(kPos.scaleX(yFac), cplPos.scaleX(yFac));
      const rDist = getDistance(kPos.scaleX(yFac), cprPos.scaleX(yFac));

      const cplPosNew = cprPos.scale(-1, kPos).scale(lDist / rDist, kPos);

      const relativeToDistance = k1.index - k0.index;

      const cpIndexRelative = cplPosNew.x - k0.index;
      const tx = capTx(cpIndexRelative / relativeToDistance);

      const value = cplPosNew.y - k1.value;

      return { relativeToDistance, tx, value };
    }

    if (direction === "left") {
      if (!timeline.keyframes[i - 1] || !k.controlPointLeft) {
        return k;
      }

      const reflect = k.reflectControlPoints && k.controlPointRight && timeline.keyframes[i + 1];

      const controlPointLeft = computeCp(i, i - 1, k.controlPointLeft);
      const controlPointRight = reflect ? reflectedRight() : k.controlPointRight;

      return { ...k, controlPointLeft, controlPointRight };
    } else {
      if (!timeline.keyframes[i + 1] || !k.controlPointRight) {
        return k;
      }

      const reflect = k.reflectControlPoints && k.controlPointLeft && timeline.keyframes[i - 1];

      const controlPointRight = computeCp(i + 1, i, k.controlPointRight);
      const controlPointLeft = reflect ? reflectedLeft() : k.controlPointLeft;

      return { ...k, controlPointRight, controlPointLeft };
    }
  });

  return { ...timeline, keyframes };
};
