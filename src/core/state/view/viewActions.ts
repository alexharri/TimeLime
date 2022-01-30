import { ViewState } from "~/core/state/stateTypes";

export const viewActions = {
  setFields: (state: Partial<ViewState>) => ({
    type: <const>"view/set-fields",
    state,
  }),
};
