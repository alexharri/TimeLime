import { ActionOptions } from "timelime/types";
import { requestAction } from "~core/state/requestAction";
import { getNextKeyframe, getPrevKeyframe } from "~core/timeline/getNextKeyframe";

interface Options {
  timelineId: string;
  direction: "forward" | "backward";
}

export function moveFrameIndexToNextKeyframe(actionOptions: ActionOptions, options: Options) {
  const { timelineId, direction } = options;

  requestAction({ userActionOptions: actionOptions }, (params) => {
    const { primary, view } = params;

    const { frameIndex } = view.state;

    const { timelines } = primary.state;
    const timeline = timelines[timelineId];

    const nextKeyframe =
      direction === "forward"
        ? getNextKeyframe(timeline, frameIndex)
        : getPrevKeyframe(timeline, frameIndex);

    if (!nextKeyframe) {
      params.cancel();
      return;
    }

    view.dispatch((actions) => actions.setFields({ frameIndex: nextKeyframe.index }));
    params.submit({ name: "Move frame index" });
  });
}
