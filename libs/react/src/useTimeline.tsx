import { useCallback, useEffect, useMemo, useState } from "react";
import { setTimelineVisible } from "timelime/core";
import { TimelineKeyframe } from "timelime/types";
import { TimelineValue } from "~react/TimelineStateContext";
import { useTimelineState } from "~react/useTimelineState";

interface Options {
  timelineId: string;
}

interface UseTimelineResult extends TimelineValue {
  setIsVisible: (isVisible: boolean) => void;
  nextKeyframe: TimelineKeyframe | null;
  prevKeyframe: TimelineKeyframe | null;
}

export function useTimeline(options: Options): UseTimelineResult {
  const { timelineId } = options;

  const { getActionOptions, getTimelineValue, subscribeToTimeline } = useTimelineState();

  const [state, setState] = useState(getTimelineValue(timelineId));

  useEffect(() => {
    const { unsubscribe } = subscribeToTimeline(timelineId, setState);
    return unsubscribe;
  }, [timelineId]);

  const setIsVisible = useCallback((visible: boolean) => {
    getActionOptions((actionOptions) => setTimelineVisible(actionOptions, { timelineId, visible }));
  }, []);

  const { nextKeyframe, prevKeyframe } = useMemo(() => {
    const { timeline, frameIndex } = state;

    let nextKeyframe: TimelineKeyframe | null = null;
    let prevKeyframe: TimelineKeyframe | null = null;

    for (const k of [...timeline.keyframes].reverse()) {
      if (k.index > frameIndex) {
        nextKeyframe = k;
      } else {
        break;
      }
    }

    for (const k of timeline.keyframes) {
      if (k.index < frameIndex) {
        prevKeyframe = k;
      } else {
        break;
      }
    }

    return { nextKeyframe, prevKeyframe };
  }, [state.timeline]);

  return useMemo(() => {
    return { ...state, setIsVisible, nextKeyframe, prevKeyframe };
  }, [state, nextKeyframe, prevKeyframe]);
}
