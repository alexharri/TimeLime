import React from "react";
import { ViewState } from "~/core/state/stateTypes";
import { Timeline, TimelineSelection } from "~/types/timelineTypes";

export interface UseTimelineResult {
  timeline: Timeline;
  selection: TimelineSelection | undefined;
  value: number;
}

export type UseTimelineLengthResult = [length: number, setLength: (length: number) => void];

export type UseTimelineCallback = (state: UseTimelineResult) => void;

export type UseTimelineLengthCallback = (length: number) => void;

export interface ITimelineStateContext {
  getViewState: () => ViewState;
  setLength: (length: number) => void;

  getTimelineValue: (timelineId: string) => UseTimelineResult;
  subscribeToTimeline: (
    timelineId: string,
    callback: UseTimelineCallback,
  ) => { unsubscribe: () => void };

  getTimelineIds: () => string[];
  subscribeToTimelineIds: (callback: (timelineIds: string[]) => void) => {
    unsubscribe: () => void;
  };

  getLength: () => number;
  subscribeToLength: (callback: UseTimelineLengthCallback) => {
    unsubscribe: () => void;
  };
}

export const TimelineStateContext = React.createContext<ITimelineStateContext | null>(null);
