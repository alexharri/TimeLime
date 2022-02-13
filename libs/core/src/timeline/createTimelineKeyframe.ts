import { Timeline, TimelineKeyframe } from "timelime/types";
import { keyframeFactory } from "~core/timeline/keyframeFactory";
import { createKeyframeId } from "~core/timeline/keyframeId";

export const createTimelineKeyframe = (
  timeline: Timeline,
  value: number,
  index: number,
): TimelineKeyframe => {
  return keyframeFactory({ id: createKeyframeId(timeline), index, value });
};
