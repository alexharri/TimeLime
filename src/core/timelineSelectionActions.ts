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

  toggleKeyframe: (timelineId: string, keyframeId: string) => ({
    type: <const>"tl-sel/toggle-keyframe",
    timelineId,
    keyframeId,
  }),
};
