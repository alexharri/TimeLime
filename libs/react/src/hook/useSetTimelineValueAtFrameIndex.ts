import { useContext, useRef } from "react";
import {
  createTimelineKeyframe,
  requestAction,
  RequestActionParams,
  splitKeyframesAtIndex,
} from "timelime/core";
import { TimelineKeyframe } from "timelime/types";
import { TimelineStateContext } from "~react/TimelineStateContext";

interface Options {
  timelineId: string;
}

export function useSetTimelineValueAtFrameIndex(options: Options) {
  const paramsRef = useRef<RequestActionParams | null>(null);

  const onValueChangeRef = useRef<((value: number) => void) | null>(null);
  const ctx = useContext(TimelineStateContext);

  const onValueChange = (value: number): void => {
    if (onValueChangeRef.current) {
      onValueChangeRef.current(value);
      return;
    }

    ctx?.getActionOptions((actionOptions) =>
      requestAction({ userActionOptions: actionOptions }, (params) => {
        paramsRef.current = params;

        const { timelineId } = options;

        const { primary, view } = params;
        const { frameIndex } = view.state;

        onValueChangeRef.current = (value) => {
          const { timelines } = primary.state;
          const timeline = timelines[timelineId];

          let keyframe: TimelineKeyframe | null = null;

          for (let i = 0; i < timeline.keyframes.length; i += 1) {
            if (timeline.keyframes[i].index === frameIndex) {
              keyframe = timeline.keyframes[i];
            }
          }

          if (keyframe) {
            const nextKeyframe = { ...keyframe, value };
            primary.dispatch((actions) => actions.setKeyframe(timelineId, nextKeyframe));
            return;
          }

          const keyframes = timeline.keyframes;

          if (frameIndex < keyframes[0].index) {
            const k = createTimelineKeyframe(timeline, value, frameIndex);
            primary.dispatch((actions) => actions.setKeyframe(timelineId, k));
            return;
          }

          if (frameIndex > keyframes[keyframes.length - 1].index) {
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

            k.value = value;

            for (const keyframe of [k0, k, k1]) {
              primary.dispatch((actions) => actions.setKeyframe(timelineId, keyframe));
            }
          }
        };

        onValueChangeRef.current(value);
      }),
    );
  };

  const onValueChangeEnd = () => {
    paramsRef.current?.submit({ name: "Update value" });
    paramsRef.current = null;
    onValueChangeRef.current = null;
  };

  return { onValueChange, onValueChangeEnd };
}
