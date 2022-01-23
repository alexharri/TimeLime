import { HistoryAction } from "~/core/state/historyActions";

export const createInitialHistoryState = <S>(
  initialState: S,
  type: "normal" | "selection"
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
});

export interface HistoryState<S> {
  type: "normal" | "selection";
  list: Array<{
    state: S;
    name: string;
    modifiedRelated: boolean;
    allowIndexShift: boolean;
  }>;
  index: number;
  indexDirection: -1 | 1;
  action: null | {
    id: string;
    state: S;
  };
}

interface Options {
  selectionForKey?: string;
}

export function createReducerWithHistory<S>(
  reducer: (state: S, action: any) => S,
  options: Options = {}
) {
  const { selectionForKey = "" } = options;

  return (state: HistoryState<S>, action: HistoryAction): HistoryState<S> => {
    switch (action.type) {
      case "history/set-index": {
        if (state.action) {
          console.warn(
            "Attempted to move history list index with an action in process."
          );
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
          console.warn(
            "Attempted to start an action with another action in process."
          );
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

      case "history/dispatch": {
        const { actionId, actionToDispatch, modifiesHistory } = action;

        if (!modifiesHistory) {
          return state;
        }

        if (!state.action) {
          console.log(actionToDispatch);
          console.warn(
            "Attempted to dispatch to an action that does not exist."
          );
          return state;
        }

        if (state.action.id !== actionId) {
          console.warn("Attempted to dispatch with the wrong action id.");
          return state;
        }

        const newState = reducer(state.action.state, actionToDispatch);

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
          modifiedKeys,
          allowIndexShift,
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

        return {
          ...state,
          list: [
            ...state.list.slice(0, state.index + 1),
            {
              state: state.action.state,
              name,
              modifiedRelated: modifiedKeys.indexOf(selectionForKey) !== -1,
              allowIndexShift,
            },
          ],
          index: state.index + 1,
          indexDirection: 1,
          action: null,
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
