import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { setTimelineVisible } from "~/core/handlers/selection/setTimelineVisible";
import { TimelineStateContext, TimelineValue } from "~react/TimelineStateContext";

interface Options {
  timelineId: string;
}

interface UseTimelineResult extends TimelineValue {
  setIsVisible: (isVisible: boolean) => void;
}

export function useTimeline(options: Options): UseTimelineResult {
  const { timelineId } = options;

  const timelineStateContext = useContext(TimelineStateContext);

  const [state, setState] = useState(timelineStateContext!.getTimelineValue(timelineId));

  useEffect(() => {
    const { unsubscribe } = timelineStateContext!.subscribeToTimeline(timelineId, setState);
    return unsubscribe;
  }, [timelineId]);

  const setIsVisible = useCallback((visible: boolean) => {
    timelineStateContext!.getActionOptions((actionOptions) => {
      setTimelineVisible(actionOptions, { timelineId, visible });
    });
  }, []);

  return useMemo(() => {
    return { ...state, setIsVisible };
  }, [state]);
}
