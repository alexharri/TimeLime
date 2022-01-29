import { StateManager } from "~/core/state/StateManager";
import { TimelineAction } from "~/core/timelineActions";
import { timelineReducer, TimelineState } from "~/core/timelineReducer";
import { TimelineSelectionAction } from "~/core/timelineSelectionActions";
import {
  timelineSelectionReducer,
  TimelineSelectionState,
} from "~/core/timelineSelectionReducer";

interface Options {
  timelineState: TimelineState;
  timelineSelectionState: TimelineSelectionState;

  onChange: (state: {
    timelineState: TimelineState;
    timelineSelectionState: TimelineSelectionState;
  }) => void;
}

export class TimelineStateManager extends StateManager<
  TimelineState,
  TimelineSelectionState,
  TimelineAction,
  TimelineSelectionAction,
  "timelineState",
  "timelineSelectionState"
> {
  constructor(options: Options) {
    super({
      initialState: options.timelineState,
      initialSelectionState: options.timelineSelectionState,

      reducer: timelineReducer,
      selectionReducer: timelineSelectionReducer,

      stateKey: "timelineState",
      selectionStateKey: "timelineSelectionState",

      onStateChangeCallback: options.onChange,
    });
  }
}
