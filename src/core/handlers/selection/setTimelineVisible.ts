import { requestAction } from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";

interface Options {
  timelineId: string;
  visible: boolean;
}

export const setTimelineVisible = (actionOptions: ActionOptions, options: Options) => {
  const { timelineId, visible } = options;

  requestAction({ userActionOptions: actionOptions }, (params) => {
    const { selection } = params;

    if (!visible) {
      selection.dispatch((actions) => actions.removeFromSelection(timelineId));
      params.submit({ name: "Remove timeline selection" });
    } else {
      selection.dispatch((actions) => actions.init(timelineId));
      params.submit({ name: "Initialize timeline selection" });
    }
  });
};
