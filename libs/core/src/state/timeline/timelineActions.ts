import {
  Rect,
  Timeline,
  TimelineKeyframe,
  TimelineKeyframeControlPoint,
  TimelineState,
} from "timelime/types";

export const timelineActions = {
  setState: (state: TimelineState) => ({
    type: <const>"tl/set-state",
    state,
  }),

  setKeyframe: (timelineId: string, keyframe: TimelineKeyframe) => ({
    type: <const>"tl/set-keyframe",
    timelineId,
    keyframe,
  }),

  removeKeyframes: (timelineId: string, keyframeIds: string[]) => ({
    type: <const>"tl/remove-keyframe",
    timelineId,
    keyframeIds,
  }),

  setDragSelectRect: (timelineId: string, rect: Rect) => ({
    type: <const>"tl/set-drag-select-rect",
    timelineId,
    rect,
  }),

  setTimeline: (timeline: Timeline) => ({
    type: <const>"tl/set-timeline",
    timeline,
  }),

  setKeyframeControlPoint: (
    timelineId: string,
    keyframeIndex: number,
    direction: "left" | "right",
    controlPoint: TimelineKeyframeControlPoint | null,
  ) => ({
    type: <const>"tl/set-keyframe-control-point",
    timelineId,
    controlPoint,
    keyframeIndex,
    direction,
  }),

  removeKeyframeControlPoints: (timelineId: string, keyframeIndex: number) => ({
    type: <const>"tl/remove-keyframe-control-points",
    timelineId,
    keyframeIndex,
  }),

  setKeyframeReflectControlPoints: (
    timelineId: string,
    keyframeIndex: number,
    reflectControlPoints: boolean,
  ) => ({
    type: <const>"tl/set-keyframe-reflect-control-points",
    timelineId,
    keyframeIndex,
    reflectControlPoints,
  }),

  // submitDragSelectRect: createAction(
  //   "timeline/SUBMIT_DRAG_SELECT",
  //   (action) => {
  //     return (timelineId: string, additiveSelection: boolean) =>
  //       action({ timelineId, additiveSelection });
  //   }
  // ),

  // setIndexAndValueShift: createAction("timeline/SET_SHIFT", (resolve) => {
  //   return (timelineId: string, indexShift: number, valueShift: number) =>
  //     resolve({ timelineId, indexShift, valueShift });
  // }),

  // setControlPointShift: createAction("timeline/SET_CP_SHIFT", (resolve) => {
  //   return (
  //     timelineId: string,
  //     controlPointShift: Timeline["_controlPointShift"]
  //   ) => resolve({ timelineId, controlPointShift });
  // }),

  // setNewControlPointShift: createAction(
  //   "timeline/SET_NEW_CP_SHIFT",
  //   (resolve) => {
  //     return (
  //       timelineId: string,
  //       newControlPointShift: Timeline["_newControlPointShift"]
  //     ) => resolve({ timelineId, newControlPointShift });
  //   }
  // ),

  // applyControlPointShift: createAction("timeline/APPLY_CP_SHIFT", (resolve) => {
  //   return (timelineId: string, selection: TimelineSelection | undefined) =>
  //     resolve({ timelineId, selection });
  // }),

  // submitIndexAndValueShift: createAction("timeline/SUBMIT_SHIFT", (resolve) => {
  //   return (timelineId: string, selection: TimelineSelection) =>
  //     resolve({ timelineId, selection });
  // }),

  // shiftTimelineIndex: createAction(
  //   "timeline/SHIFT_TIMELINE_INDEX",
  //   (resolve) => {
  //     return (timelineId: string, shiftBy: number) =>
  //       resolve({ timelineId, shiftBy });
  //   }
  // ),

  // setYBounds: createAction("timeline/SET_Y_BOUNDS", (resolve) => {
  //   return (timelineId: string, yBounds: [number, number] | null) =>
  //     resolve({ timelineId, yBounds });
  // }),

  // setYPan: createAction("timeline/SET_Y_PAN", (resolve) => {
  //   return (timelineId: string, yPan: number) => resolve({ timelineId, yPan });
  // }),
};

// export const timelineSelectionActions = {
//   addKeyframes: createAction("timeline_selection/ADD_KEYFRAMES", (action) => {
//     return (timelineId: string, keyframeIds: string[]) =>
//       action({ timelineId, keyframeIds });
//   }),

//   removeKeyframes: createAction(
//     "timeline_selection/REMOVE_KEYFRAMES",
//     (action) => {
//       return (timelineId: string, keyframeIds: string[]) =>
//         action({ timelineId, keyframeIds });
//     }
//   ),

//   toggleKeyframe: createAction(
//     "timeline_selection/TOGGLE_KEYFRAME_SELECTION",
//     (resolve) => {
//       return (timelineId: string, keyframeId: string) =>
//         resolve({ timelineId, keyframeId });
//     }
//   ),

//   clear: createAction("timeline_selection/CLEAR_SELECTION", (resolve) => {
//     return (timelineId: string) => resolve({ timelineId });
//   }),
// };
