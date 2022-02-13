import { useContext, useEffect, useState } from "react";
import { TimelineStateContext } from "~react/TimelineStateContext";

export function useTimelineValues<K extends string>(timelineIds: K[]): Record<K, number> {
  const timelineStateContext = useContext(TimelineStateContext);

  const [values, setValues] = useState(() =>
    timelineIds.reduce((obj, timelineId) => {
      obj[timelineId] = timelineStateContext!.getTimelineValue(timelineId).value;
      return obj;
    }, {} as Record<K, number>),
  );

  useEffect(() => {
    const unsubscribeList: Array<() => void> = [];

    for (const timelineId of timelineIds) {
      const { unsubscribe } = timelineStateContext!.subscribeToTimeline(timelineId, (value) => {
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
