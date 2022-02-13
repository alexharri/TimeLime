import { createKeyframeId } from "~/core/timeline/keyframeId";
import { Timeline, TimelineKeyframe } from "~/types/timelineTypes";

export const createTimelineKeyframe = (
  timeline: Timeline,
  value: number,
  index: number,
): TimelineKeyframe => {
  return {
    id: createKeyframeId(timeline),
    index,
    value,
    controlPointLeft: null,
    controlPointRight: null,
    reflectControlPoints: false,
  };
};
