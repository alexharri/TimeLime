import { keyframeFactory } from "~/core/timeline/keyframeFactory";
import { createKeyframeId } from "~/core/timeline/keyframeId";
import { Timeline, TimelineKeyframe } from "~/types/timelineTypes";

export const createTimelineKeyframe = (
  timeline: Timeline,
  value: number,
  index: number,
): TimelineKeyframe => {
  return keyframeFactory({ id: createKeyframeId(timeline), index, value });
};
