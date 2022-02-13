import { ActionsReturnType, ViewState } from "timelime/types";
import { viewActions } from "~core/state/view/viewActions";

export function viewReducer(
  state: ViewState,
  action: ActionsReturnType<typeof viewActions>,
): ViewState {
  switch (action.type) {
    case "view/set-fields":
      return { ...state, ...action.state };
    default:
      return state;
  }
}
