import { useCallback, useEffect, useMemo, useState } from "react";
import { setTimelineVisible } from "timelime/core";
import { TimelineValue } from "~react/TimelineStateContext";
import { useTimelineState } from "~react/useTimelineState";

interface Options {
  timelineId: string;
}

interface UseTimelineResult extends TimelineValue {
  setIsVisible: (isVisible: boolean) => void;
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

  return useMemo(() => {
    return { ...state, setIsVisible };
  }, [state]);
}
