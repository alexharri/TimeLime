import { areMapsShallowEqual } from "map-fns";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StateManager } from "~/core/state/StateManager/StateManager";
import { RenderState } from "~/core/state/stateTypes";
import { TimelineState } from "~/core/state/timeline/timelineReducer";
import { TimelineSelectionState } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { applyControlPointShift } from "~/core/timeline/applyControlPointShift";
import { applyNewControlPointShift } from "~/core/timeline/applyNewControlPointShift";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { getTimelineValueAtIndex } from "~/core/timeline/timelineValueAtIndex";
import { Timeline, TimelineSelection } from "~/types/timelineTypes";

interface SingleTimelineState {
  timeline: Timeline;
  selection: TimelineSelection | undefined;
  value: number;
}

type SubscribeCallback = (state: SingleTimelineState) => void;

interface ITimelineStateContext {
  getTimelineValue: (timelineId: string) => SingleTimelineState;
  subscribeToTimeline: (
    timelineId: string,
    callback: SubscribeCallback,
  ) => { unsubscribe: () => void };
}

export const TimelineStateContext = React.createContext<ITimelineStateContext | null>(null);

interface Props {
  stateManager: StateManager<TimelineState, TimelineSelectionState>;
  renderStateRef: React.MutableRefObject<RenderState>;
}

interface Listener {
  id: number;
  timelineId: string;
  callback: SubscribeCallback;
}

export const TimelineStateProvider: React.FC<Props> = (props) => {
  const { renderStateRef: currStateRef } = props;

  const idRef = useRef(0);
  const listeners = useMemo<Listener[]>(() => [], []);

  const prevStateRef = useRef<RenderState>(currStateRef.current);
  // const currStateRef = useRef<RenderState>(initialRenderState);

  const getTimelineValue = useCallback((timelineId: string): SingleTimelineState => {
    const { primary, selection, view, ephemeral } = prevStateRef.current;

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

  useEffect(() => {
    let mounted = true;
    const tick = () => {
      if (!mounted) {
        return;
      }
      requestAnimationFrame(tick);

      const prevState = prevStateRef.current;
      const state = currStateRef.current;
      prevStateRef.current = state;

      if (state === prevState) {
        return; // Render state did not update
      }
      console.log("updated");

      if (state.view.frameIndex !== prevState.view.frameIndex) {
        for (const { callback, timelineId } of listeners) {
          callback(getTimelineValue(timelineId));
        }
        return;
      }

      prevStateRef.current = state;
      const { ephemeral } = state;
      const { newControlPointShift, controlPointShift, keyframeShift } = ephemeral;

      for (const listener of listeners) {
        const { timelineId } = listener;
        let updated = false;

        if (state.primary.timelines[timelineId] !== prevState.primary.timelines[timelineId]) {
          updated = true;
        }

        const currSelection = state.selection[timelineId];
        const prevSelection = prevState.selection[timelineId];
        if (!!currSelection !== !!prevState) {
          updated = true;
        }

        if (currSelection && prevSelection && !areMapsShallowEqual(currSelection, prevSelection)) {
          updated = true;
        }

        if (currSelection) {
          const nSelected = Object.keys(currSelection.keyframes);

          if (
            nSelected.length > 0 &&
            (newControlPointShift || controlPointShift || keyframeShift)
          ) {
            updated = true;
          }
        }

        if (!updated) {
          continue;
        }

        executeListener(listener);
      }
    };
    requestAnimationFrame(tick);

    return () => {
      mounted = false;
    };
  }, []);

  // useEffect(() => {
  //   props.onRenderStateChange((renderState) => {
  //     prevStateRef.current = renderState;
  //     for (const listener of listeners) {
  //       executeListener(listener);
  //     }
  //   });
  // }, []);

  const executeListener = useCallback(({ callback: listener, timelineId }: Listener) => {
    listener(getTimelineValue(timelineId));
  }, []);

  const value = useMemo<ITimelineStateContext>(() => {
    return {
      getTimelineValue,
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
