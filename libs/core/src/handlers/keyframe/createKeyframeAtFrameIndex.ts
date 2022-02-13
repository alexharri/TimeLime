import { ActionOptions } from "timelime/types";
import { requestAction } from "~core/state/requestAction";
import { createTimelineKeyframe } from "~core/timeline/createTimelineKeyframe";
import { splitKeyframesAtIndex } from "~core/timeline/splitKeyframesAtIndex";

interface Options {
  timelineId: string;
}

export function createKeyframeAtFrameIndex(actionOptions: ActionOptions, options: Options) {
  const { timelineId } = options;

  requestAction({ userActionOptions: actionOptions }, (params) => {
    const { primary, selection, view } = params;

    const { timelines } = primary.state;
    const { frameIndex } = view.state;

    const timeline = timelines[timelineId];

    const keyframes = timeline.keyframes;

    if (frameIndex < keyframes[0].index) {
      const value = keyframes[0].value;
      const k = createTimelineKeyframe(timeline, value, frameIndex);
      primary.dispatch((actions) => actions.setKeyframe(timelineId, k));
      return;
    }

    if (frameIndex > keyframes[keyframes.length - 1].index) {
      const value = keyframes[keyframes.length - 1].value;
      const k = createTimelineKeyframe(timeline, value, frameIndex);
      primary.dispatch((actions) => actions.setKeyframe(timelineId, k));
      return;
    }

    for (let i = 0; i < keyframes.length; i += 1) {
      if (keyframes[i].index > frameIndex) {
        continue;
      }

      if (keyframes[i].index === frameIndex) {
        return keyframes[i].value;
      }

      if (frameIndex > keyframes[i + 1].index) {
        continue;
      }

      const [k0, k, k1] = splitKeyframesAtIndex(
        timeline,
        keyframes[i],
        keyframes[i + 1],
        frameIndex,
      );

      for (const keyframe of [k0, k, k1]) {
        primary.dispatch((actions) => actions.setKeyframe(timelineId, keyframe));
      }

      for (const timelineId of Object.keys(selection.state)) {
        selection.dispatch((actions) => actions.emptyIfExists(timelineId));
      }
      selection.dispatch((actions) => actions.toggleKeyframe(timelineId, k.id));

      params.submit({ name: "Create keyframe" });
      return;
    }

    throw new Error(`Could not create keyframe at frame index ${frameIndex}.`);
  });
}
