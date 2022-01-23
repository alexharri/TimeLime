import { ComponentMeta } from "@storybook/react";
import { mapMap } from "map-fns";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { renderGraphEditor } from "~/core/render/renderGraphEditor";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { StateManager } from "~/core/state/StateManager";
import { applyIndexAndValueShift } from "~/core/timeline/applyIndexAndValueShift";
import { timelineReducer, TimelineState } from "~/core/timelineReducer";
import { timelineSelectionActions } from "~/core/timelineSelectionActions";
import { timelineSelectionReducer } from "~/core/timelineSelectionReducer";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { createGlobalToNormalFn } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Timeline } from "~/types/timelineTypes";

export default {
  title: "Actions/Move Keyframe",
} as ComponentMeta<React.ComponentType>;

export const Test = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  const length = 200;
  const timeline = useMemo(() => {
    const timeline: Timeline = {
      id: "test",
      keyframes: curvesToKeyframes([
        [
          [0, 0],
          [20, 10],
          [80, 90],
          [100, 100],
        ],
        [
          [100, 100],
          [140, 121],
          [180, 30],
          [200, 100],
        ],
      ]),
    };
    return timeline;
  }, []);

  const [n, setN] = useState(0);

  const stateManager = useMemo(() => {
    const timelineState: TimelineState = {
      timelines: {
        [timeline.id]: timeline,
      },
    };

    return new StateManager({
      reducer: timelineReducer,
      selectionReducer: timelineSelectionReducer,

      initialState: timelineState,
      initialSelectionState: {},

      stateKey: "timelineState",
      selectionStateKey: "timelineSelectionState",

      onStateChangeCallback: () => setN((n) => n + 1),
    });
  }, []);

  const [indexAndValueShift, setIndexAndValueShift] =
    useState<Vec2 | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    const viewport = ref.current?.getBoundingClientRect();

    if (!viewport) {
      return;
    }

    const actionToPerform = getActionToPerformOnMouseDown({
      e,
      length,
      timelines: { [timeline.id]: timeline },
      viewport,
    });

    if (actionToPerform.type !== "mousedown_keyframe") {
      return;
    }

    stateManager.requestAction((params) => {
      params.execOnComplete(() => setIndexAndValueShift(null));

      params.dispatch(timelineSelectionActions.clear(timeline.id));
      params.dispatch(
        timelineSelectionActions.toggleKeyframe(
          timeline.id,
          actionToPerform.keyframe.id
        )
      );

      const { timelines } = stateManager.getActionState().timelineState;

      const globalToNormal = createGlobalToNormalFn({
        length,
        viewport,
        yBounds: getGraphEditorYBounds({
          length,
          timelines,
          viewBounds: [0, 1],
        }),
      });

      const initialMousePosition = Vec2.fromEvent(e).apply(globalToNormal);

      params.addListener.repeated("mousemove", (e) => {
        const mousePosition = Vec2.fromEvent(e).apply(globalToNormal);

        const moveVector = mousePosition.sub(initialMousePosition);

        setIndexAndValueShift(Vec2.new(Math.round(moveVector.x), moveVector.y));
      });

      params.addListener.once("mouseup", () => {
        params.cancelAction();
      });
    });
  };

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    const { timelineState, timelineSelectionState } =
      stateManager.getActionState();
    let { timelines } = timelineState;

    if (indexAndValueShift) {
      timelines = mapMap(timelines, (timeline) =>
        applyIndexAndValueShift({
          timeline,
          timelineSelection: timelineSelectionState[timeline.id],
          shift: indexAndValueShift,
        })
      );
    }

    renderGraphEditor({ ctx, length, timelines, timelineSelectionState });
  }, [indexAndValueShift, n]);

  return (
    <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />
  );
};
