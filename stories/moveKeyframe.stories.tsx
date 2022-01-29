import "./preventGlobals";

import { ComponentMeta } from "@storybook/react";
import { mapMap } from "map-fns";
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { onMousedownKeyframe } from "~/core/handlers/mousedownKeyframe";
import { renderGraphEditor } from "~/core/render/renderGraphEditor";
import { StateManager } from "~/core/state/StateManager";
import {
  EphemeralState,
  RenderState,
  ViewState,
} from "~/core/state/stateTypes";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { timelineReducer, TimelineState } from "~/core/timelineReducer";
import { timelineSelectionReducer } from "~/core/timelineSelectionReducer";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { ViewBounds } from "~/types/commonTypes";
import { Timeline } from "~/types/timelineTypes";
import { timelineActions } from "~/core/timelineActions";
import { timelineSelectionActions } from "~/core/timelineSelectionActions";
import { isKeyCodeOf } from "~/core/listener/keyboard";

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

  const [ephState, setEphState] = useState<EphemeralState>({});
  const [viewState, setViewState] = useState<ViewState>({
    length,
    viewBounds: [0, 1],
    viewport: {
      top: 0,
      left: 0,
      width: 800,
      height: 400,
    },
  });

  // const ephStateManager = useMemo(() => {
  //   return new GraphEditorEphStateManager({ onChange: setEphState });
  // }, []);

  const render = (renderState: RenderState) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    const { timelineState, timelineSelectionState } = renderState.primary;
    const { length, viewport, viewBounds } = renderState.view;
    const { keyframeShift, yBounds, yPan } = renderState.ephemeral;

    let { timelines } = timelineState;

    if (keyframeShift) {
      timelines = mapMap(timelines, (timeline) =>
        applyTimelineKeyframeShift({
          timeline,
          timelineSelection: timelineSelectionState[timeline.id],
          keyframeShift,
        })
      );
    }

    length;

    renderGraphEditor({
      ctx,
      length,
      timelines,
      width: viewport.width,
      height: viewport.height,
      timelineSelectionState,
      viewBounds,
      yBounds,
      yPan,
    });
  };

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

    const { timelineId, keyframe } = actionToPerform;

    stateManager.requestAction((params) => {
      const actionState = stateManager.getActionState();

      const initialViewState = viewState;

      onMousedownKeyframe(
        {
          onCancel: () => {
            setEphState({});
            setViewState(initialViewState);
            params.cancelAction();
          },
          onEphemeralStateChange: setEphState,
          onViewStateChange: setViewState,
          onPrimaryStateChange: (primaryState) => {
            const { timelineState, timelineSelectionState } = primaryState;

            for (const timeline of Object.values(timelineState.timelines)) {
              params.dispatch(timelineActions.setTimeline(timeline));

              const timelineSelection = timelineSelectionState[timeline.id];
              if (timelineSelection) {
                params.dispatch(
                  timelineSelectionActions.setTimelineSelection(
                    timeline.id,
                    timelineSelection
                  )
                );
              } else {
                params.dispatch(timelineSelectionActions.clear(timeline.id));
              }
            }
          },
          onSubmit: () => params.submitAction("Move keyframe"),
          primary: {
            timelineState: actionState.timelineState,
            timelineSelectionState: actionState.timelineSelectionState,
          },
          view: initialViewState,
          render,
        },
        { e, keyframe, timelineId }
      );
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

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (isKeyCodeOf("Z", e.keyCode) && e.metaKey && e.shiftKey) {
        stateManager.redo();
        return;
      }
      if (isKeyCodeOf("Z", e.keyCode) && e.metaKey) {
        stateManager.undo();
        return;
      }
    };

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  });

  return (
    <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />
  );
};
