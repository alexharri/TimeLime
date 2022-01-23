import { Vec2 } from "~/core/utils/math/Vec2";
import {
  Timeline,
  TimelineKeyframe,
  TimelineSelection,
} from "~/types/timelineTypes";

interface Options {
  timeline: Timeline;
  timelineSelection?: TimelineSelection;
  shift: Vec2;
}

export const applyIndexAndValueShift = (options: Options): Timeline => {
  const { timeline, timelineSelection, shift } = options;

  if (shift.atOrigin || !timelineSelection) {
    return timeline;
  }

  const removeKeyframesAtIndex = new Set<number>();

  if (shift.x !== 0) {
    for (let i = 0; i < timeline.keyframes.length; i += 1) {
      const keyframe = timeline.keyframes[i];
      if (timelineSelection.keyframes[keyframe.id]) {
        removeKeyframesAtIndex.add(keyframe.index + shift.x);
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
      console.log(keyframe, timelineSelection.keyframes[keyframe.id]);
      if (timelineSelection.keyframes[keyframe.id]) {
        return {
          ...keyframe,
          index: keyframe.index + shift.x,
          value: keyframe.value + shift.y,
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
