import { useContext, useEffect, useState } from "react";
import { TimelineStateContext, UseTimelineResult } from "~/react/TimelineStateContext";

interface Options {
  timelineId: string;
}

export function useTimeline(options: Options): UseTimelineResult {
  const { timelineId } = options;

  const ctx = useContext(TimelineStateContext);

  const [state, setState] = useState(ctx!.getTimelineValue(timelineId));

  useEffect(() => {
    const { unsubscribe } = ctx!.subscribeToTimeline(timelineId, setState);
    return unsubscribe;
  }, [timelineId]);

  return state;
}
