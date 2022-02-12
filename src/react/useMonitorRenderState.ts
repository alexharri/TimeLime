import { areMapsShallowEqual } from "map-fns";
import { useEffect, useRef } from "react";
import { RenderState } from "~/core/state/stateTypes";
import {
  UseTimelineIdsListener,
  UseTimelineLengthListener,
  UseTimelineStateListener,
} from "~/react/types";
import { areArraysShallowEqual } from "~/react/utils/arrayUtils";

function didTimelineChange(prevState: RenderState, currState: RenderState, timelineId: string) {
  if (currState.primary.timelines[timelineId] !== prevState.primary.timelines[timelineId]) {
    // The timeline was directly modified.
    return true;
  }

  const currSelection = currState.selection[timelineId];
  const prevSelection = prevState.selection[timelineId];
  if (!!currSelection !== !!prevState) {
    // The timeline's selection changed.
    return true;
  }

  if (currSelection && prevSelection && !areMapsShallowEqual(currSelection, prevSelection)) {
    // The timeline's selection changed.
    return true;
  }

  if (currSelection) {
    const { newControlPointShift, controlPointShift, keyframeShift } = currState.ephemeral;

    // Check if the timeline is affected by the ephemeral state.
    //
    // If the timeline is affected by the ephemeral state, we consider it to have changed
    // if the ephemeral state has changed.
    if (
      // Check that the ephemeral state would affect this timeline.
      Object.keys(currSelection.keyframes).length > 0 &&
      // Check that some shifts are present.
      (newControlPointShift || controlPointShift || keyframeShift) &&
      // Check that the ephemeral state changed.
      currState.ephemeral !== prevState.ephemeral
    ) {
      return true;
    }
  }

  return false;
}

interface Options {
  getCurrentState: () => RenderState;
  timelineIdsListeners: UseTimelineIdsListener[];
  timelineLengthListeners: UseTimelineLengthListener[];
  timelineListeners: UseTimelineStateListener[];
  executeTimelineCallback: (listener: UseTimelineStateListener) => void;
}

export function useMonitorRenderState(options: Options) {
  const prevStateRef = useRef<RenderState>(options.getCurrentState());

  useEffect(() => {
    let unmounted = false;

    // We do not need to get the listeners on each tick since `useTimelineState` pushes
    // directly to the listeners array instead of creating a new one.
    const {
      timelineListeners,
      timelineIdsListeners,
      timelineLengthListeners,
      executeTimelineCallback: executeCallback,
    } = options;

    const tick = () => {
      if (unmounted) {
        return;
      }
      requestAnimationFrame(tick);

      const prevState = prevStateRef.current;
      const currState = options.getCurrentState();
      prevStateRef.current = currState;

      if (currState === prevState) {
        return; // Render state did not update in the previous frame.
      }

      const prevTimelineIds = Object.keys(prevState.primary.timelines);
      const currTimelineIds = Object.keys(currState.primary.timelines);

      if (!areArraysShallowEqual(prevTimelineIds, currTimelineIds)) {
        for (const listener of timelineIdsListeners) {
          listener.callback(currTimelineIds);
        }
      }

      if (prevState.view.length !== currState.view.length) {
        for (const listener of timelineLengthListeners) {
          listener.callback(currState.view.length);
        }
      }

      // If the frame index changed between frames, all timelines will be affected.
      if (currState.view.frameIndex !== prevState.view.frameIndex) {
        for (const listener of timelineListeners) {
          executeCallback(listener);
        }
        return;
      }

      for (const listener of timelineListeners) {
        if (!didTimelineChange(prevState, currState, listener.timelineId)) {
          continue;
        }
        executeCallback(listener);
      }
    };
    requestAnimationFrame(tick);

    return () => {
      unmounted = true;
    };
  }, []);
}
