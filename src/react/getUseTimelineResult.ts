import { RenderState } from "~/core/state/stateTypes";
import { applyControlPointShift } from "~/core/timeline/applyControlPointShift";
import { applyNewControlPointShift } from "~/core/timeline/applyNewControlPointShift";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { getTimelineValueAtIndex } from "~/core/timeline/timelineValueAtIndex";
import { UseTimelineResult } from "~/react/TimelineStateContext";

export function getUseTimelineResult(
  timelineId: string,
  renderState: RenderState,
): UseTimelineResult {
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

  return { timeline, selection: timelineSelection, value };
}
