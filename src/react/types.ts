import { UseTimelineCallback, UseTimelineLengthCallback } from "~/react/TimelineStateContext";

export interface UseTimelineStateListener {
  id: number;
  timelineId: string;
  callback: UseTimelineCallback;
}

export interface UseTimelineIdsListener {
  id: number;
  callback: (timelineIds: string[]) => void;
}

export interface UseTimelineLengthListener {
  id: number;
  callback: UseTimelineLengthCallback;
}
