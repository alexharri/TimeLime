import { Timeline } from "~/types/timelineTypes";

export function createKeyframeId(timeline: Timeline) {
  const numberIds = timeline.keyframes.map((k) => parseInt(k.id)).filter(Number.isFinite);
  return String(Math.max(0, ...numberIds) + 1);
}
