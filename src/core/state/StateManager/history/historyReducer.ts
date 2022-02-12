import { HistoryAction } from "~/core/state/StateManager/history/historyActions";

export const createInitialHistoryState = <S>(
  initialState: S,
  type: "normal" | "selection",
): HistoryState<S> => ({
  type,
  list: [
    {
      state: initialState,
      name: "Initial state",
      modifiedRelated: false,
      allowIndexShift: false,
    },
  ],
  index: 0,
  indexDirection: 1,
  action: null,
  preferredRedo: null,
});

interface StateEntry<S> {
  state: S;
  name: string;
  modifiedRelated: boolean;
  allowIndexShift: boolean;
}

export interface HistoryState<S> {
  type: "normal" | "selection";
  list: StateEntry<S>[];
  index: number;
  indexDirection: -1 | 1;
  action: null | {
    id: string;
    state: S;
  };
  preferredRedo: null | {
    list: StateEntry<S>[];
    index: number;
  };
}

export function createReducerWithHistory<S>() {
  return (state: HistoryState<S>, action: HistoryAction): HistoryState<S> => {
    switch (action.type) {
      case "history/restore-preferred-redo": {
        if (state.action) {
          console.warn("Attempted to move history list index with an action in process.");
          return state;
        }

        const { preferredRedo } = state;

        if (!preferredRedo) {
          console.warn("Attempted to restore a preferred redo history that does not exist.");
          return state;
        }

        return {
          ...state,
          list: preferredRedo.list,
          index: preferredRedo.index,
          indexDirection: 1,
          preferredRedo: null,
        };
      }

      case "history/set-index": {
        if (state.action) {
          console.warn("Attempted to move history list index with an action in process.");
          return state;
        }

        const { index } = action;
        return {
          ...state,
          index,
          indexDirection: index > state.index ? 1 : -1,
        };
      }

      case "history/start": {
        if (state.action) {
          console.warn("Attempted to start an action with another action in process.");
          return state;
        }

        const { actionId } = action;

        const shiftForward =
          state.type === "selection" &&
          state.indexDirection === -1 &&
          state.list[state.index + 1].modifiedRelated &&
          state.list[state.index + 1].allowIndexShift;

        return {
          ...state,
          action: {
            id: actionId,
            state: state.list[state.index + (shiftForward ? 1 : 0)].state,
          },
        };
      }

      case "history/set-action-state": {
        const { actionId, modifiesHistory } = action;

        if (!modifiesHistory) {
          return state;
        }

        if (!state.action) {
          console.warn("Attempted to set the state of an action that does not exist.");
          return state;
        }

        if (state.action.id !== actionId) {
          console.warn("Attempted to dispatch with the wrong action id.");
          return state;
        }

        const newState = action.state;

        if (newState === state.action.state) {
          // State was not modified
          return state;
        }

        return {
          ...state,
          action: {
            ...state.action,
            state: newState,
          },
        };
      }

      case "history/submit": {
        const {
          actionId,
          name,
          modifiesHistory,
          allowIndexShift,
          modifiedState,
          modifiedSelectionState,
        } = action;

        if (!modifiesHistory) {
          return {
            ...state,
            action: null,
          };
        }

        if (!state.action) {
          console.warn("Attempted to submit an action that does not exist.");
          return state;
        }

        if (state.action.id !== actionId) {
          console.warn("Attempted to submit with the wrong action id.");
          return state;
        }

        let preferredRedo: HistoryState<S>["preferredRedo"] = null;

        if (modifiedState) {
          preferredRedo = null;
        } else if (modifiedSelectionState) {
          preferredRedo = state.preferredRedo;

          // If there are actions to redo, set them as the preferred redo
          if (state.index < state.list.length - 1 && !preferredRedo) {
            preferredRedo = {
              list: state.list,
              index: state.index + 1,
            };
          }
        }

        return {
          ...state,
          list: [
            ...state.list.slice(0, state.index + 1),
            {
              state: state.action.state,
              name,
              modifiedRelated: state.type === "selection" && modifiedState,
              allowIndexShift,
            },
          ],
          index: state.index + 1,
          indexDirection: 1,
          action: null,
          preferredRedo,
        };
      }

      case "history/cancel": {
        const { actionId } = action;

        if (!state.action) {
          console.warn("Attempted to cancel an action that does not exist.");
          return state;
        }

        if (state.action.id !== actionId) {
          console.warn("Attempted to cancel with the wrong action id.");
          return state;
        }

        return {
          ...state,
          action: null,
        };
      }

      default: {
        return state;
      }
    }
  };
}
