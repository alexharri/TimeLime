import { useEffect, useState } from "react";
import { UseTimelineLengthResult } from "~react/TimelineStateContext";
import { useTimelineState } from "~react/useTimelineState";

export function useTimelineLength(): UseTimelineLengthResult {
  const { getLength, setLength, subscribeToLength } = useTimelineState();

  const [length, _setLength] = useState(getLength());

  useEffect(() => {
    const { unsubscribe } = subscribeToLength(_setLength);
    return unsubscribe;
  }, []);

  return [length, setLength];
}
