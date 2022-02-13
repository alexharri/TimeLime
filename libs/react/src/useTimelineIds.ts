import { useEffect, useState } from "react";
import { useTimelineState } from "~react/useTimelineState";

export function useTimelineIds(): string[] {
  const { getTimelineIds, subscribeToTimelineIds } = useTimelineState();

  const [timelineIds, setTimelineIds] = useState(getTimelineIds());

  useEffect(() => {
    const { unsubscribe } = subscribeToTimelineIds(setTimelineIds);
    return unsubscribe;
  }, []);

  return timelineIds;
}
