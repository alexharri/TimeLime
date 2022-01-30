import {
  TimelineSelection,
  TimelineSelectionState,
} from "~/core/state/timelineSelection/timelineSelectionReducer";

export const timelineSelectionActions = {
  clear: (timelineId: string) => ({
    type: <const>"tl-sel/clear",
    timelineId,
  }),

  setState: (state: TimelineSelectionState) => ({
    type: <const>"tl-sel/set-state",
    state,
  }),

  setTimelineSelection: (timelineId: string, selection: TimelineSelection) => ({
    type: <const>"tl-sel/set-timeline",
    timelineId,
    selection,
  }),

  toggleKeyframe: (timelineId: string, keyframeId: string) => ({
    type: <const>"tl-sel/toggle-keyframe",
    timelineId,
    keyframeId,
  }),
};
