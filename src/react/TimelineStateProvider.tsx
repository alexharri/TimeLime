import React, { useCallback, useMemo, useRef } from "react";
import { RenderState } from "~/core/state/stateTypes";
import { applyControlPointShift } from "~/core/timeline/applyControlPointShift";
import { applyNewControlPointShift } from "~/core/timeline/applyNewControlPointShift";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { getTimelineValueAtIndex } from "~/core/timeline/timelineValueAtIndex";
import {
  ITimelineStateContext,
  TimelineStateContext,
  UseTimelineResult,
} from "~/react/TimelineStateContext";
import { UseTimelineStateListener } from "~/react/types";
import { useMonitorRenderState } from "~/react/useMonitorRenderState";

interface Props {
  /**
   * A reference to the always-up-to-date current RenderState.
   */
  renderStateRef: React.MutableRefObject<RenderState>;
}

export const TimelineStateProvider: React.FC<Props> = (props) => {
  const idRef = useRef(0);
  const listeners = useMemo<UseTimelineStateListener[]>(() => [], []);

  const currStateRef = props.renderStateRef;

  const getUseTimelineResult = useCallback((timelineId: string): UseTimelineResult => {
    const { primary, selection, view, ephemeral } = currStateRef.current;

    const { frameIndex } = view;
    const { keyframeShift, controlPointShift, newControlPointShift } = ephemeral;

    let timeline = primary.timelines[timelineId];
    const timelineSelection = selection[timelineId];

    if (keyframeShift) {
      timeline = applyTimelineKeyframeShift({ timeline, timelineSelection, keyframeShift });
    }

    if (controlPointShift) {
      timeline = applyControlPointShift({ timeline, timelineSelection, controlPointShift });
    }

    if (newControlPointShift) {
      timeline =
        timeline.id === newControlPointShift.timelineId
          ? applyNewControlPointShift(timeline, newControlPointShift)
          : timeline;
    }

    const value = getTimelineValueAtIndex({ frameIndex, timeline });

    return { timeline, selection: timelineSelection, value };
  }, []);

  useMonitorRenderState({
    listeners,
    getCurrentState: () => currStateRef.current,
    executeCallback: (listener) => executeListener(listener),
  });

  const executeListener = useCallback(
    ({ callback: listener, timelineId }: UseTimelineStateListener) => {
      listener(getUseTimelineResult(timelineId));
    },
    [],
  );

  const value = useMemo<ITimelineStateContext>(() => {
    return {
      getTimelineValue: getUseTimelineResult,
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
    <TimelineStateContext.Provider value={value}>{props.children}</TimelineStateContext.Provider>
  );
};
