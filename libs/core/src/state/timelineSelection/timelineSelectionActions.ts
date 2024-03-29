import { TimelineSelection, TimelineSelectionState } from "timelime/types";

export const timelineSelectionActions = {
  removeAll: () => ({
    type: <const>"tl-sel/remove-all",
  }),

  removeFromSelection: (timelineId: string) => ({
    type: <const>"tl-sel/remove",
    timelineId,
  }),

  init: (timelineId: string) => ({
    type: <const>"tl-sel/init",
    timelineId,
  }),

  emptyIfExists: (timelineId: string) => ({
    type: <const>"tl-sel/empty-if-exists",
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
