import { ActionOptions } from "timelime/types";
import { isKeyDown } from "~core/listener/keyboard";
import { requestAction } from "~core/state/requestAction";

interface Options {
  timelineId: string;
}

export function selectKeyframeAtFrameIndex(actionOptions: ActionOptions, options: Options) {
  const { timelineId } = options;

  const additiveSelection = isKeyDown("Shift");

  requestAction({ userActionOptions: actionOptions }, (params) => {
    const { primary, selection, view } = params;

    const { timelines } = primary.state;
    const { frameIndex } = view.state;

    const timeline = timelines[timelineId];
    const keyframe = timeline.keyframes.find((k) => k.index === frameIndex)!;

    if (additiveSelection) {
      selection.dispatch((actions) => actions.toggleKeyframe(timelineId, keyframe.id));
    } else {
      for (const timelineId of Object.keys(selection.state)) {
        selection.dispatch((actions) => actions.emptyIfExists(timelineId));
      }
      selection.dispatch((actions) => actions.toggleKeyframe(timelineId, keyframe.id));
    }

    params.submit({ name: "Modify selection" });
  });
}
