type HistoryActions = typeof historyActions;
type HistoryActionReturnTypes = {
  [K in keyof HistoryActions]: ReturnType<HistoryActions[K]>;
};

export type HistoryAction =
  HistoryActionReturnTypes[keyof HistoryActionReturnTypes];

export const historyActions = {
  restorePreferredRedo: () => ({
    type: <const>"history/restore-preferred-redo",
  }),

  setHistoryIndex: (index: number) => ({
    type: <const>"history/set-index",
    index,
  }),

  startAction: (actionId: string) => ({
    type: <const>"history/start",
    actionId,
  }),

  dispatchToAction: (
    actionId: string,
    actionToDispatch: any,
    modifiesHistory: boolean
  ) => ({
    type: <const>"history/dispatch",
    actionId,
    actionToDispatch,
    modifiesHistory,
  }),

  submitAction: (
    actionId: string,
    name: string,
    modifiesHistory: boolean,
    modifiedState: boolean,
    modifiedSelectionState: boolean,
    allowIndexShift: boolean
  ) => ({
    type: <const>"history/submit",
    actionId,
    name,
    modifiesHistory,
    modifiedState,
    modifiedSelectionState,
    allowIndexShift,
  }),

  cancelAction: (actionId: string) => ({
    type: <const>"history/cancel",
    actionId,
  }),
};
