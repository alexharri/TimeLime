import { ComponentMeta } from "@storybook/react";
import { mapMap } from "map-fns";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { renderGraphEditor } from "~/core/render/renderGraphEditor";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { StateManager } from "~/core/state/StateManager";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import {
  GraphEditorEphState,
  GraphEditorEphStateManager,
} from "~/core/timeline/GraphEditorEphState";
import { timelineActions } from "~/core/timelineActions";
import { timelineReducer, TimelineState } from "~/core/timelineReducer";
import { timelineSelectionActions } from "~/core/timelineSelectionActions";
import { timelineSelectionReducer } from "~/core/timelineSelectionReducer";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { createGlobalToNormalFn } from "~/core/utils/coords/globalToNormal";
import { Vec2 } from "~/core/utils/math/Vec2";
import { ViewBounds } from "~/types/commonTypes";
import { Timeline } from "~/types/timelineTypes";

export default {
  title: "Actions/Move Keyframe",
} as ComponentMeta<React.ComponentType>;

export const Test = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  const length = 200;
  const viewBounds: ViewBounds = [0, 1];

  const [n, setN] = useState(0);

  const stateManager = useMemo(() => {
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

  const [ephState, setEphState] = useState<GraphEditorEphState>({});

  const ephStateManager = useMemo(() => {
    return new GraphEditorEphStateManager({ onChange: setEphState });
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    const viewport = ref.current?.getBoundingClientRect();

    if (!viewport) {
      return;
    }

    const actionToPerform = getActionToPerformOnMouseDown({
      e,
      length,
      timelines: stateManager.getActionState().timelineState.timelines,
      viewport,
    });

    console.log(actionToPerform);

    if (actionToPerform.type !== "mousedown_keyframe") {
      return;
    }

    const { timelineState } = stateManager.getActionState();
    const timeline = timelineState.timelines[actionToPerform.timelineId];

    stateManager.requestAction((params) => {
      params.execOnComplete(() => ephStateManager.reset());

      params.dispatch(timelineSelectionActions.clear(timeline.id));
      params.dispatch(
        timelineSelectionActions.toggleKeyframe(
          timeline.id,
          actionToPerform.keyframe.id
        )
      );
      const { timelines } = stateManager.getActionState().timelineState;

      ephStateManager.yBounds = getGraphEditorYBounds({
        length,
        timelines,
        viewBounds,
      });

      const globalToNormal = createGlobalToNormalFn({
        length,
        viewport,
        viewBounds,
        timelines,
      });

      const initialMousePosition = Vec2.fromEvent(e).apply(globalToNormal);

      let keyframeShift: Vec2 | undefined;

      params.addListener.repeated("mousemove", (e) => {
        const mousePosition = Vec2.fromEvent(e).apply(globalToNormal);

        const moveVector = mousePosition.sub(initialMousePosition);

        keyframeShift = Vec2.new(Math.round(moveVector.x), moveVector.y);
        ephStateManager.keyframeShift = keyframeShift;
      });

      params.addListener.once("mouseup", () => {
        if (!keyframeShift) {
          params.cancelAction();
          return;
        }

        const nextTimeline = applyTimelineKeyframeShift({
          keyframeShift,
          timeline,
          timelineSelection:
            stateManager.getActionState().timelineSelectionState[timeline.id],
        });

        params.dispatch(timelineActions.setTimeline(nextTimeline));
        params.submitAction();
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

    const { keyframeShift, yBounds } = ephState;

    if (keyframeShift) {
      timelines = mapMap(timelines, (timeline) =>
        applyTimelineKeyframeShift({
          timeline,
          timelineSelection: timelineSelectionState[timeline.id],
          keyframeShift,
        })
      );
    }

    renderGraphEditor({
      ctx,
      length,
      timelines,
      timelineSelectionState,
      yBounds,
    });
  }, [ephState, n]);

  return (
    <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />
  );
};
