import React, { useMemo, useRef } from "react";
import { RenderState } from "~/core/state/stateTypes";
import { getUseTimelineResult } from "~/react/getUseTimelineResult";
import { ITimelineStateContext, TimelineStateContext } from "~/react/TimelineStateContext";
import {
  UseTimelineIdsListener,
  UseTimelineLengthListener,
  UseTimelineStateListener,
} from "~/react/types";
import { useMonitorRenderState } from "~/react/useMonitorRenderState";

interface Props {
  /**
   * A reference to the always-up-to-date current RenderState.
   */
  renderStateRef: React.MutableRefObject<RenderState>;
  setLength: (length: number) => void;
}

export const TimelineStateProvider: React.FC<Props> = (props) => {
  const { renderStateRef, setLength } = props;

  const idRef = useRef(0);
  const timelineListeners = useMemo<UseTimelineStateListener[]>(() => [], []);
  const timelineIdsListeners = useMemo<UseTimelineIdsListener[]>(() => [], []);
  const timelineLengthListeners = useMemo<UseTimelineLengthListener[]>(() => [], []);

  useMonitorRenderState({
    timelineListeners,
    timelineIdsListeners,
    timelineLengthListeners,
    getCurrentState: () => renderStateRef.current,
    executeTimelineCallback: ({ callback, timelineId }) =>
      callback(getUseTimelineResult(timelineId, renderStateRef.current)),
  });

  const contextValue = useMemo(() => {
    const createUnsubscribe = (listeners: Array<{ id: number }>, id: number) => {
      return () => {
        const index = listeners.findIndex((listener) => listener.id === id);
        if (index === -1) {
          return;
        }
        listeners.splice(index, 1);
      };
    };

    const value: ITimelineStateContext = {
      getViewState: () => renderStateRef.current.view,
      setLength,

      getTimelineIds: () => Object.keys(renderStateRef.current.primary.timelines),
      subscribeToTimelineIds: (callback) => {
        const id = ++idRef.current;
        timelineIdsListeners.push({ id, callback });
        return { unsubscribe: createUnsubscribe(timelineIdsListeners, id) };
      },

      getTimelineValue: (timelineId) => getUseTimelineResult(timelineId, renderStateRef.current),
      subscribeToTimeline: (timelineId, callback) => {
        const id = ++idRef.current;
        timelineListeners.push({ id, timelineId, callback });
        return { unsubscribe: createUnsubscribe(timelineListeners, id) };
      },

      getLength: () => renderStateRef.current.view.length,
      subscribeToLength: (callback) => {
        const id = ++idRef.current;
        timelineLengthListeners.push({ id, callback });
        return { unsubscribe: createUnsubscribe(timelineLengthListeners, id) };
      },
    };
    return value;
  }, []);

  return (
    <TimelineStateContext.Provider value={contextValue}>
      {props.children}
    </TimelineStateContext.Provider>
  );
};
