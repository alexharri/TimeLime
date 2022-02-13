import { Timeline } from "~/types/timelineTypes";

const digitsReg = /^\d+$/;

export function createKeyframeId(timeline: Timeline) {
  const numberIds = timeline.keyframes
    .filter((k) => digitsReg.test(k.id))
    .map((k) => parseInt(k.id));
  return String(Math.max(0, ...numberIds) + 1);
}
