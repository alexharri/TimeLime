import {
  TimelineSelection,
  TimelineSelectionState,
} from "~/core/timelineSelectionReducer";

type TimelineSelectionActions = typeof timelineSelectionActions;
type TimelineSelectionActionReturnTypes = {
  [K in keyof TimelineSelectionActions]: ReturnType<
    TimelineSelectionActions[K]
  >;
};

export type TimelineSelectionAction =
  TimelineSelectionActionReturnTypes[keyof TimelineSelectionActionReturnTypes];

export const timelineSelectionActions = {
  clear: (timelineId: string) => ({
    type: <const>"tl-sel/clear",
    timelineId,
  }),

  setAll: (state: TimelineSelectionState) => ({
    type: <const>"tl-sel/set-all",
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
