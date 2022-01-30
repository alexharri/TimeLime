import { EphemeralState } from "~/core/state/stateTypes";

export const ephemeralActions = {
  setFields: (state: Partial<EphemeralState>) => ({
    type: <const>"ephemeral/set-fields",
    state,
  }),
};
