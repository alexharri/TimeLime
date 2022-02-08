import { UseTimelineCallback } from "~/react/TimelineStateContext";

export interface UseTimelineStateListener {
  id: number;
  timelineId: string;
  callback: UseTimelineCallback;
}
