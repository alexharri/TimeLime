import { ActionOptions } from "timelime/types";
import { requestAction } from "~core/state/requestAction";

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

    let nextIndex: number | undefined;

    if (direction === "forward") {
      for (const k of [...timeline.keyframes].reverse()) {
        if (k.index > frameIndex) {
          nextIndex = k.index;
        } else {
          break;
        }
      }
    } else {
      for (const k of timeline.keyframes) {
        if (k.index < frameIndex) {
          nextIndex = k.index;
        } else {
          break;
        }
      }
    }

    if (typeof nextIndex !== "number") {
      params.cancel();
      return;
    }

    view.dispatch((actions) => actions.setFields({ frameIndex: nextIndex }));
    params.submit({ name: "Move frame index" });
  });
}
