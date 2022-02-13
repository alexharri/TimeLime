import { useEffect, useState } from "react";
import { useTimelineState } from "~react/useTimelineState";

export function useTimelineValues<K extends string>(timelineIds: K[]): Record<K, number> {
  const { getTimelineValue, subscribeToTimeline } = useTimelineState();

  const [values, setValues] = useState(() =>
    timelineIds.reduce((obj, timelineId) => {
      obj[timelineId] = getTimelineValue(timelineId).value;
      return obj;
    }, {} as Record<K, number>),
  );

  useEffect(() => {
    const unsubscribeList: Array<() => void> = [];

    for (const timelineId of timelineIds) {
      const { unsubscribe } = subscribeToTimeline(timelineId, (value) => {
        setValues((values) => ({ ...values, [timelineId]: value.value }));
      });
      unsubscribeList.push(unsubscribe);
    }

    return () => {
      for (const unsubscribe of unsubscribeList) {
        unsubscribe();
      }
    };
  }, [timelineIds]);

  return values;
}
