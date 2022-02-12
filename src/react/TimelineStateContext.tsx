import React from "react";
import { Timeline, TimelineSelection } from "~/types/timelineTypes";

export interface UseTimelineResult {
  timeline: Timeline;
  selection: TimelineSelection | undefined;
  value: number;
}

export type UseTimelineCallback = (state: UseTimelineResult) => void;

export interface ITimelineStateContext {
  getTimelineValue: (timelineId: string) => UseTimelineResult;
  subscribeToTimeline: (
    timelineId: string,
    callback: UseTimelineCallback,
  ) => { unsubscribe: () => void };

  getTimelineIds: () => string[];
  subscribeToTimelineIds: (callback: (timelineIds: string[]) => void) => {
    unsubscribe: () => void;
  };
}

export const TimelineStateContext = React.createContext<ITimelineStateContext | null>(null);
