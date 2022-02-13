import { ViewState } from "timelime/types";

export const viewActions = {
  setFields: (state: Partial<ViewState>) => ({
    type: <const>"view/set-fields",
    state,
  }),
};
