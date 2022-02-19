import React from "react";
import { GetActionOptions, Timeline, TimelineSelection, ViewState } from "timelime/types";
import { GraphEditorProps } from "~react/types";

export interface TimelineValue {
  timeline: Timeline;
  selection: TimelineSelection | undefined;
  value: number;
  frameIndex: number;
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

  getActionOptions: GetActionOptions;
}

export const TimelineStateContext = React.createContext<ITimelineStateContext | null>(null);
