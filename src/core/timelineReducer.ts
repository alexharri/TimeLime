import { mergeInMap } from "map-fns";
import { TimelineAction } from "~/core/timelineActions";
import { getInsertionIndex } from "~/core/utils/getInsertionIndex";
import { Timeline } from "~/types/timelineTypes";

export interface TimelineState {
  timelines: { [timelineId: string]: Timeline };
}

export const initialTimelineState: TimelineState = {
  timelines: {},
};

export function timelineReducer(
  state: TimelineState,
  action: TimelineAction
): TimelineState {
  switch (action.type) {
    case "set-keyframe": {
      const { keyframe, timelineId } = action;

      const timeline = state.timelines[timelineId];
      const keyframes = [...timeline.keyframes];
      const keyframeIds = keyframes.map((k) => k.id);

      const currentIndex = keyframeIds.indexOf(keyframe.id);
      if (currentIndex !== -1) {
        keyframes.splice(currentIndex, 1);
      }

      const indexOfKeyframeAtIndex = keyframes
        .map((k) => k.index)
        .indexOf(keyframe.index);

      if (indexOfKeyframeAtIndex !== -1) {
        keyframes.splice(indexOfKeyframeAtIndex, 1);
      }

      const insertIndex = getInsertionIndex(
        keyframes,
        keyframe,
        (a, b) => a.index - b.index
      );
      keyframes.splice(insertIndex, 0, keyframe);

      return {
        ...state,
        timelines: mergeInMap(state.timelines, timelineId, { keyframes }),
      };
    }

    case "remove-keyframe": {
      const { timelineId, keyframeIds } = action;
      const set = new Set(keyframeIds);
      return {
        ...state,
        timelines: mergeInMap(state.timelines, timelineId, {
          keyframes: (keyframes) => keyframes.filter((k) => !set.has(k.id)),
        }),
      };
    }

    // case getType(timelineActions.setYPan): {
    //   const { timelineId, yPan } = action;

    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...state[timelineId],
    //       _yPan: yPan,
    //     },
    //   };
    // }

    // case getType(timelineActions.setYBounds): {
    //   const { timelineId, yBounds } = action;

    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...state[timelineId],
    //       _yBounds: yBounds,
    //     },
    //   };
    // }

    // case getType(timelineActions.setIndexAndValueShift): {
    //   const { timelineId, indexShift, valueShift } = action;
    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...state[timelineId],
    //       _indexShift: indexShift,
    //       _valueShift: valueShift,
    //     },
    //   };
    // }

    // case getType(timelineActions.setControlPointShift): {
    //   const { timelineId, controlPointShift } = action;
    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...state[timelineId],
    //       _controlPointShift: controlPointShift,
    //     },
    //   };
    // }

    // case getType(timelineActions.setNewControlPointShift): {
    //   const { timelineId, newControlPointShift } = action;
    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...state[timelineId],
    //       _newControlPointShift: newControlPointShift,
    //     },
    //   };
    // }

    // case getType(timelineActions.applyControlPointShift): {
    //   const { timelineId, selection } = action;
    //   return {
    //     ...state,
    //     [timelineId]: applyTimelineIndexAndValueShifts(
    //       state[timelineId],
    //       selection
    //     ),
    //   };
    // }

    // case getType(timelineActions.submitIndexAndValueShift): {
    //   const { timelineId, selection } = action;
    //   const timeline = applyTimelineIndexAndValueShifts(
    //     state[timelineId],
    //     selection
    //   );
    //   return {
    //     ...state,
    //     [timelineId]: timeline,
    //   };
    // }

    // case getType(timelineActions.shiftTimelineIndex): {
    //   const { timelineId, shiftBy } = action;
    //   const timeline = state[timelineId];
    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...timeline,
    //       keyframes: timeline.keyframes.map((k) => ({
    //         ...k,
    //         index: k.index + shiftBy,
    //       })),
    //     },
    //   };
    // }

    // case getType(timelineActions.setKeyframeReflectControlPoints): {
    //   const { timelineId, keyframeIndex, reflectControlPoints } =
    //     action;

    //   const timeline = state[timelineId];

    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...timeline,
    //       keyframes: timeline.keyframes.map((keyframe, index) => {
    //         if (keyframeIndex !== index) {
    //           return keyframe;
    //         }

    //         return { ...keyframe, reflectControlPoints };
    //       }),
    //     },
    //   };
    // }

    // case getType(timelineActions.setKeyframeControlPoint): {
    //   const { timelineId, keyframeIndex, controlPoint, direction } =
    //     action;
    //   const newKeyframe: TimelineKeyframe = {
    //     ...state[timelineId].keyframes[keyframeIndex],
    //   };

    //   if (direction === "right") {
    //     newKeyframe.controlPointRight = controlPoint;
    //   } else {
    //     newKeyframe.controlPointLeft = controlPoint;
    //   }

    //   const timeline = state[timelineId];

    //   return {
    //     ...state,
    //     [timelineId]: {
    //       ...timeline,
    //       keyframes: timeline.keyframes.map((keyframe, index) => {
    //         if (keyframeIndex !== index) {
    //           return keyframe;
    //         }

    //         return newKeyframe;
    //       }),
    //     },
    //   };
    // }

    default:
      return state;
  }
}
