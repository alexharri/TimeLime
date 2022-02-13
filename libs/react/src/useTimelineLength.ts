import { useContext, useEffect, useState } from "react";
import { TimelineStateContext, UseTimelineLengthResult } from "~react/TimelineStateContext";

export function useTimelineLength(): UseTimelineLengthResult {
  const ctx = useContext(TimelineStateContext);

  const [length, _setLength] = useState(ctx!.getLength());

  useEffect(() => {
    const { unsubscribe } = ctx!.subscribeToLength(_setLength);
    return unsubscribe;
  }, []);

  return [length, ctx!.setLength];
}
