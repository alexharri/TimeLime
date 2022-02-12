import { modifyInMap, removeKeysFromMap } from "map-fns";
import { timelineSelectionActions } from "~/core/state/timelineSelection/timelineSelectionActions";
import { ActionsReturnType } from "~/types/commonTypes";

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
  action: ActionsReturnType<typeof timelineSelectionActions>,
): TimelineSelectionState {
  switch (action.type) {
    case "tl-sel/remove-all":
      return {};

    case "tl-sel/empty-if-exists": {
      const { timelineId } = action;

      if (!state[timelineId]) {
        return state;
      }

      return { ...state, [timelineId]: { keyframes: {} } };
    }

    case "tl-sel/init": {
      const { timelineId } = action;
      return { ...state, [timelineId]: { keyframes: {} } };
    }

    case "tl-sel/remove": {
      const { timelineId } = action;
      return removeKeysFromMap(state, timelineId);
    }

    case "tl-sel/set-state": {
      return action.state;
    }

    case "tl-sel/set-timeline": {
      const { timelineId, selection } = action;
      return { ...state, [timelineId]: selection };
    }

    case "tl-sel/toggle-keyframe": {
      const { timelineId, keyframeId } = action;

      if (!state[timelineId]) {
        return {
          ...state,
          [timelineId]: { keyframes: { [keyframeId]: true } },
        };
      }

      return modifyInMap(state, timelineId, (selection) => {
        if (!selection) return { keyframes: { [keyframeId]: true } };

        if (selection.keyframes[keyframeId]) {
          return {
            keyframes: removeKeysFromMap(selection.keyframes, keyframeId),
          };
        }

        return { keyframes: { ...selection.keyframes, [keyframeId]: true } };
      });
    }

    case "tl-sel/add-keyframes": {
      const { timelineId, keyframeIds } = action;
      return {
        ...state,
        [timelineId]: {
          keyframes: {
            ...state[timelineId]?.keyframes,
            ...keyframeIds.reduce<Record<string, boolean>>((obj, key) => {
              obj[key] = true;
              return obj;
            }, {}),
          },
        },
      };
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
