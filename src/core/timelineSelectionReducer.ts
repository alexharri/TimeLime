import { modifyInMap, removeKeysFromMap } from "map-fns";
import { TimelineSelectionAction } from "~/core/timelineSelectionActions";

export interface TimelineSelection {
  keyframes: {
    [keyframeId: string]: boolean;
  };
}

export type TimelineSelectionState = Partial<{
  [timelineId: string]: TimelineSelection;
}>;

export const initialTimelineSelectionState: TimelineSelectionState = {};

export function timelineSelectionReducer(
  state: TimelineSelectionState,
  action: TimelineSelectionAction
): TimelineSelectionState {
  switch (action.type) {
    case "tl-sel/clear": {
      const { timelineId } = action;
      return {
        ...state,
        [timelineId]: { keyframes: {} },
      };
    }

    case "tl-sel/toggle-keyframe": {
      const { timelineId, keyframeId } = action;

      return modifyInMap(state, timelineId, (selection) => {
        if (!selection) {
          return { keyframes: { [keyframeId]: true } };
        }

        if (selection.keyframes[keyframeId]) {
          return {
            keyframes: removeKeysFromMap(selection.keyframes, keyframeId),
          };
        }

        return { keyframes: { ...selection.keyframes, [keyframeId]: true } };
      });
    }

    // case getType(timelineSelectionActions.clear): {
    // 	const { timelineId } = action.payload;
    // 	return removeKeysFromMap(state, [timelineId]);
    // }

    // case getType(timelineSelectionActions.toggleKeyframe): {
    // 	const { timelineId, keyframeId } = action.payload;

    // 	const newState = { ...state };

    // 	if (!newState[timelineId]) {
    // 		newState[timelineId] = { keyframes: {} };
    // 	}

    // 	const newTimeline = { ...newState[timelineId]! };

    // 	if (newTimeline.keyframes[keyframeId]) {
    // 		newTimeline.keyframes = Object.keys(newTimeline.keyframes).reduce<KeySelectionMap>(
    // 			(obj, key) => {
    // 				if (keyframeId !== key) {
    // 					obj[key] = true;
    // 				}
    // 				return obj;
    // 			},
    // 			{},
    // 		);
    // 		return newState;
    // 	}

    // 	return {
    // 		...newState,
    // 		[timelineId]: {
    // 			...newTimeline,
    // 			keyframes: {
    // 				...newTimeline.keyframes,
    // 				[keyframeId]: true,
    // 			},
    // 		},
    // 	};
    // }

    // case getType(timelineSelectionActions.addKeyframes): {
    // 	const { timelineId, keyframeIds } = action.payload;
    // 	return {
    // 		...state,
    // 		[timelineId]: {
    // 			keyframes: {
    // 				...state[timelineId]?.keyframes,
    // 				...keyframeIds.reduce<KeySelectionMap>((obj, key) => {
    // 					obj[key] = true;
    // 					return obj;
    // 				}, {}),
    // 			},
    // 		},
    // 	};
    // }

    // case getType(timelineSelectionActions.removeKeyframes): {
    // 	const { timelineId, keyframeIds } = action.payload;
    // 	return {
    // 		...state,
    // 		[timelineId]: {
    // 			keyframes: removeKeysFromMap(state[timelineId]?.keyframes || {}, keyframeIds),
    // 		},
    // 	};
    // }

    default:
      return state;
  }
}
