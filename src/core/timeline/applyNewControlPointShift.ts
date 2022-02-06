import { capToRange } from "~/core/utils/math/math";
import { NewControlPointShift, Timeline, TimelineKeyframe } from "~/types/timelineTypes";

export const applyNewControlPointShift = (
  timeline: Timeline,
  newControlPointShift: NewControlPointShift,
): Timeline => {
  const { shiftVector, keyframeId, direction } = newControlPointShift;

  const keyframes = timeline.keyframes.map<TimelineKeyframe>((k, i) => {
    if (k.id !== keyframeId) {
      return k;
    }

    const k0 = timeline.keyframes[i - 1];
    const k1 = timeline.keyframes[i];
    const k2 = timeline.keyframes[i + 1];

    const fac = direction === "left" ? 1 : -1;
    const cap = (t: number) => capToRange(0, 1, t);

    const controlPointLeft = k0
      ? {
          value: shiftVector.y * fac,
          tx: cap((k1.index + shiftVector.x * fac - k0.index) / (k1.index - k0.index)),
          relativeToDistance: k1.index - k0.index,
        }
      : null;

    const controlPointRight = k2
      ? {
          value: -(shiftVector.y * fac),
          tx: cap(1 - (k2.index + shiftVector.x * fac - k1.index) / (k2.index - k1.index)),
          relativeToDistance: k2.index - k1.index,
        }
      : null;

    return { ...k, controlPointLeft, controlPointRight };
  });

  return { ...timeline, keyframes };
};
