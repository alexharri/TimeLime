import { useCallback, useEffect, useMemo, useState } from "react";
import { getNextKeyframe, getPrevKeyframe, setTimelineVisible } from "timelime/core";
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
    return {
      nextKeyframe: getNextKeyframe(timeline, frameIndex),
      prevKeyframe: getPrevKeyframe(timeline, frameIndex),
    };
  }, [state.timeline, state.frameIndex]);

  return useMemo(() => {
    return { ...state, setIsVisible, nextKeyframe, prevKeyframe };
  }, [state, nextKeyframe, prevKeyframe]);
}
