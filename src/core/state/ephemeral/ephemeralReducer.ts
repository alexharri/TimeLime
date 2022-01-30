import { ephemeralActions } from "~/core/state/ephemeral/ephemeralActions";
import { EphemeralState } from "~/core/state/stateTypes";
import { ActionsReturnType } from "~/types/commonTypes";

export function ephemeralReducer(
  state: EphemeralState,
  action: ActionsReturnType<typeof ephemeralActions>
): EphemeralState {
  switch (action.type) {
    case "ephemeral/set-fields":
      return { ...state, ...action.state };
    default:
      return state;
  }
}
