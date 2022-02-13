import {
  applyControlPointShift,
  applyNewControlPointShift,
  applyTimelineKeyframeShift,
  getTimelineValueAtIndex,
} from "timelime/core";
import { RenderState } from "timelime/types";
import { TimelineValue } from "~react/TimelineStateContext";

export function getTimelineValue(timelineId: string, renderState: RenderState): TimelineValue {
  const { primary, selection, view, ephemeral } = renderState;

  const { frameIndex } = view;
  const { keyframeShift, controlPointShift, newControlPointShift } = ephemeral;

  let timeline = primary.timelines[timelineId];
  const timelineSelection = selection[timelineId];

  if (keyframeShift) {
    timeline = applyTimelineKeyframeShift({ timeline, timelineSelection, keyframeShift });
  }

  if (controlPointShift) {
    timeline = applyControlPointShift({ timeline, timelineSelection, controlPointShift });
  }

  if (newControlPointShift) {
    timeline =
      timeline.id === newControlPointShift.timelineId
        ? applyNewControlPointShift(timeline, newControlPointShift)
        : timeline;
  }

  const value = getTimelineValueAtIndex({ frameIndex, timeline });

  return { timeline, selection: timelineSelection, value, frameIndex };
}
