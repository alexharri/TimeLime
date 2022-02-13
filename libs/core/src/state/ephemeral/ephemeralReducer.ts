import { ActionsReturnType, EphemeralState } from "timelime/types";
import { ephemeralActions } from "~core/state/ephemeral/ephemeralActions";

export function ephemeralReducer(
  state: EphemeralState,
  action: ActionsReturnType<typeof ephemeralActions>,
): EphemeralState {
  switch (action.type) {
    case "ephemeral/set-fields":
      return { ...state, ...action.state };
    default:
      return state;
  }
}
