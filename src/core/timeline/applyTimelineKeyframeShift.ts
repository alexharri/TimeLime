import { Vec2 } from "~/core/utils/math/Vec2";
import {
  Timeline,
  TimelineKeyframe,
  TimelineSelection,
} from "~/types/timelineTypes";

interface Options {
  timeline: Timeline;
  timelineSelection?: TimelineSelection;
  keyframeShift: Vec2;
}

export const applyTimelineKeyframeShift = (options: Options): Timeline => {
  const { timeline, timelineSelection, keyframeShift } = options;

  if (keyframeShift.atOrigin || !timelineSelection) {
    return timeline;
  }

  const removeKeyframesAtIndex = new Set<number>();

  if (keyframeShift.x !== 0) {
    for (let i = 0; i < timeline.keyframes.length; i += 1) {
      const keyframe = timeline.keyframes[i];
      if (timelineSelection.keyframes[keyframe.id]) {
        removeKeyframesAtIndex.add(keyframe.index + keyframeShift.x);
      }
    }
  }

  const keyframes = [...timeline.keyframes]
    .filter((keyframe) => {
      if (timelineSelection.keyframes[keyframe.id]) {
        return true;
      }

      return !removeKeyframesAtIndex.has(keyframe.index);
    })
    .map<TimelineKeyframe>((keyframe) => {
      if (timelineSelection.keyframes[keyframe.id]) {
        return {
          ...keyframe,
          index: keyframe.index + keyframeShift.x,
          value: keyframe.value + keyframeShift.y,
        };
      }

      return keyframe;
    })
    .sort((a, b) => a.index - b.index);

  return {
    ...timeline,
    keyframes,
  };
};
