import React from "react";
import { ActionOptions, ViewState } from "~/types/stateTypes";
import { Timeline, TimelineSelection } from "~/types/timelineTypes";
import { GraphEditorProps } from "~react/types";

export interface TimelineValue {
  timeline: Timeline;
  selection: TimelineSelection | undefined;
  value: number;
}

export type UseTimelineLengthResult = [length: number, setLength: (length: number) => void];

export type UseTimelineCallback = (state: TimelineValue) => void;

export type UseTimelineLengthCallback = (length: number) => void;

export interface ITimelineStateContext {
  getViewState: () => ViewState;
  setLength: (length: number) => void;

  GraphEditor: React.ComponentType<GraphEditorProps>;

  getTimelineValue: (timelineId: string) => TimelineValue;
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

  getActionOptions: (callback: (actionOptions: ActionOptions) => void) => void;
}

export const TimelineStateContext = React.createContext<ITimelineStateContext | null>(null);
