import { EphemeralState } from "timelime/types";

export const ephemeralActions = {
  setFields: (state: Partial<EphemeralState>) => ({
    type: <const>"ephemeral/set-fields",
    state,
  }),
};
