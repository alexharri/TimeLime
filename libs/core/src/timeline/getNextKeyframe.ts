import { Timeline, TimelineKeyframe } from "timelime/types";

export function getNextKeyframe(timeline: Timeline, frameIndex: number) {
  let nextKeyframe: TimelineKeyframe | null = null;

  for (const k of [...timeline.keyframes].reverse()) {
    if (k.index > frameIndex) {
      nextKeyframe = k;
    } else {
      break;
    }
  }

  return nextKeyframe;
}

export function getPrevKeyframe(timeline: Timeline, frameIndex: number) {
  let prevKeyframe: TimelineKeyframe | null = null;

  for (const k of timeline.keyframes) {
    if (k.index < frameIndex) {
      prevKeyframe = k;
    } else {
      break;
    }
  }

  return prevKeyframe;
}
