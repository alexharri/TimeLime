import React, { useMemo, useRef } from "react";
import { RenderState } from "~/core/state/stateTypes";
import { getUseTimelineResult } from "~/react/getUseTimelineResult";
import { ITimelineStateContext, TimelineStateContext } from "~/react/TimelineStateContext";
import { UseTimelineIdsListener, UseTimelineStateListener } from "~/react/types";
import { useMonitorRenderState } from "~/react/useMonitorRenderState";

interface Props {
  /**
   * A reference to the always-up-to-date current RenderState.
   */
  renderStateRef: React.MutableRefObject<RenderState>;
}

export const TimelineStateProvider: React.FC<Props> = (props) => {
  const { renderStateRef } = props;

  const idRef = useRef(0);
  const timelineListeners = useMemo<UseTimelineStateListener[]>(() => [], []);
  const timelineIdsListeners = useMemo<UseTimelineIdsListener[]>(() => [], []);

  useMonitorRenderState({
    timelineListeners,
    timelineIdsListeners,
    getCurrentState: () => renderStateRef.current,
    executeTimelineCallback: ({ callback, timelineId }) =>
      callback(getUseTimelineResult(timelineId, renderStateRef.current)),
  });

  const contextValue = useMemo<ITimelineStateContext>(() => {
    const createUnsubscribe = (listeners: Array<{ id: number }>, id: number) => {
      return () => {
        const index = listeners.findIndex((listener) => listener.id === id);
        if (index === -1) {
          return;
        }
        listeners.splice(index, 1);
      };
    };

    return {
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
    };
  }, []);

  return (
    <TimelineStateContext.Provider value={contextValue}>
      {props.children}
    </TimelineStateContext.Provider>
  );
};
