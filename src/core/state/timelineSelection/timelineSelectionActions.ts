import {
  TimelineSelection,
  TimelineSelectionState,
} from "~/core/state/timelineSelection/timelineSelectionReducer";

export const timelineSelectionActions = {
  removeAll: () => ({
    type: <const>"tl-sel/remove-all",
  }),

  removeFromSelection: (timelineId: string) => ({
    type: <const>"tl-sel/remove",
    timelineId,
  }),

  empty: (timelineId: string) => ({
    type: <const>"tl-sel/empty",
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

  addKeyframes: (timelineId: string, keyframeIds: string[]) => ({
    type: <const>"tl-sel/add-keyframes",
    timelineId,
    keyframeIds,
  }),
};
