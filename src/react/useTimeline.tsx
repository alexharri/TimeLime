import { useContext, useEffect, useState } from "react";
import { TimelineStateContext, UseTimelineResult } from "~/react/TimelineStateContext";

interface Options {
  timelineId: string;
}

export function useTimeline(options: Options): UseTimelineResult {
  const { timelineId } = options;

  const timelineStateContext = useContext(TimelineStateContext);

  const [state, setState] = useState(timelineStateContext!.getTimelineValue(timelineId));

  useEffect(() => {
    const { unsubscribe } = timelineStateContext!.subscribeToTimeline(timelineId, setState);
    return unsubscribe;
  }, [timelineId]);

  return state;
}
