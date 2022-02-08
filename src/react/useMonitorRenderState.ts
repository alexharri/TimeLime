import { areMapsShallowEqual } from "map-fns";
import { useEffect, useRef } from "react";
import { RenderState } from "~/core/state/stateTypes";
import { UseTimelineStateListener } from "~/react/types";

interface Options {
  getCurrentState: () => RenderState;
  listeners: UseTimelineStateListener[];
  executeCallback: (listener: UseTimelineStateListener) => void;
}

export function useMonitorRenderState(options: Options) {
  const prevStateRef = useRef<RenderState>(options.getCurrentState());

  useEffect(() => {
    let unmounted = false;

    // We do not need to get the listeners on each tick since `useTimelineState` pushes
    // directly to the listeners array instead of creating a new one.
    const { listeners, executeCallback } = options;

    const tick = () => {
      if (unmounted) {
        return;
      }
      requestAnimationFrame(tick);

      const prevState = prevStateRef.current;
      const state = options.getCurrentState();
      prevStateRef.current = state;

      if (state === prevState) {
        return; // Render state did not update
      }

      if (state.view.frameIndex !== prevState.view.frameIndex) {
        for (const listener of listeners) {
          executeCallback(listener);
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

        executeCallback(listener);
      }
    };
    requestAnimationFrame(tick);

    return () => {
      unmounted = true;
    };
  }, []);
}
