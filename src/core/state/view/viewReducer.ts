import { ViewState } from "~/core/state/stateTypes";
import { viewActions } from "~/core/state/view/viewActions";
import { ActionsReturnType } from "~/types/commonTypes";

export function viewReducer(
  state: ViewState,
  action: ActionsReturnType<typeof viewActions>
): ViewState {
  switch (action.type) {
    case "view/set-fields":
      return { ...state, ...action.state };
    default:
      return state;
  }
}
