import { createKeyframeId } from "~/core/timeline/keyframeId";
import { Timeline, TimelineKeyframe } from "~/types/timelineTypes";

export const createTimelineKeyframe = (
  timeline: Timeline,
  value: number,
  index: number,
): TimelineKeyframe => {
  return {
    controlPointLeft: null,
    controlPointRight: null,
    id: createKeyframeId(timeline),
    index,
    value,
    reflectControlPoints: false,
  };
};
