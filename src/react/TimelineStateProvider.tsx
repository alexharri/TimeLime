import React, { useMemo, useRef } from "react";
import { RenderState } from "~/core/state/stateTypes";
import { getUseTimelineResult } from "~/react/getUseTimelineResult";
import { ITimelineStateContext, TimelineStateContext } from "~/react/TimelineStateContext";
import { UseTimelineStateListener } from "~/react/types";
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
  const listeners = useMemo<UseTimelineStateListener[]>(() => [], []);

  useMonitorRenderState({
    listeners,
    getCurrentState: () => renderStateRef.current,
    executeCallback: ({ callback, timelineId }) =>
      callback(getUseTimelineResult(timelineId, renderStateRef.current)),
  });

  const contextValue = useMemo<ITimelineStateContext>(() => {
    return {
      getTimelineValue: (timelineId) => getUseTimelineResult(timelineId, renderStateRef.current),
      subscribeToTimeline: (timelineId, callback) => {
        const id = ++idRef.current;
        listeners.push({ id, timelineId, callback });

        return {
          unsubscribe: () => {
            const index = listeners.findIndex((listener) => listener.id === id);
            if (index === -1) {
              return;
            }
            listeners.splice(index, 1);
          },
        };
      },
    };
  }, []);

  return (
    <TimelineStateContext.Provider value={contextValue}>
      {props.children}
    </TimelineStateContext.Provider>
  );
};
