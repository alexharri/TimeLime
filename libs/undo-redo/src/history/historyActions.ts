type HistoryActions = typeof historyActions;
type HistoryActionReturnTypes = {
  [K in keyof HistoryActions]: ReturnType<HistoryActions[K]>;
};

export type HistoryAction = HistoryActionReturnTypes[keyof HistoryActionReturnTypes];

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

  setActionState: (actionId: string, state: any, modifiesHistory: boolean) => ({
    type: <const>"history/set-action-state",
    actionId,
    state,
    modifiesHistory,
  }),

  submitAction: (
    actionId: string,
    name: string,
    modifiesHistory: boolean,
    modifiedState: boolean,
    modifiedSelectionState: boolean,
    allowIndexShift: boolean,
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
