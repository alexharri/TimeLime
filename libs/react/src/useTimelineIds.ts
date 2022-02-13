import { useContext, useEffect, useState } from "react";
import { TimelineStateContext } from "~react/TimelineStateContext";

export function useTimelineIds(): string[] {
  const ctx = useContext(TimelineStateContext);

  const [timelineIds, setTimelineIds] = useState(ctx!.getTimelineIds());

  useEffect(() => {
    const { unsubscribe } = ctx!.subscribeToTimelineIds(setTimelineIds);
    return unsubscribe;
  }, []);

  return timelineIds;
}
