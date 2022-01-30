import "./preventGlobals";

import { ComponentMeta } from "@storybook/react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { onMousedownKeyframe } from "~/core/handlers/mousedownKeyframe";
import { renderGraphEditorWithRenderState } from "~/core/render/renderGraphEditor";
import {
  EphemeralState,
  RenderState,
  ViewState,
} from "~/core/state/stateTypes";
import {
  timelineReducer,
  TimelineState,
} from "~/core/state/timeline/timelineReducer";
import { timelineSelectionReducer } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { timelineActions } from "~/core/state/timeline/timelineActions";
import { timelineSelectionActions } from "~/core/state/timelineSelection/timelineSelectionActions";
import { useStateManager } from "~/core/state/StateManager/useStateManager";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getGraphEditorCursor } from "~/core/render/cursor/graphEditorCursor";
import { mapMap } from "map-fns";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { isKeyCodeOf } from "~/core/listener/keyboard";

const initialTimelineState: TimelineState = {
  timelines: {
    test: {
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
    },
  },
};

export default {
  title: "Actions/Move Keyframe",
} as ComponentMeta<React.ComponentType>;

export const Test = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  const length = 200;

  const { state, stateManager } = useStateManager({
    reducer: timelineReducer,
    selectionReducer: timelineSelectionReducer,

    initialState: initialTimelineState,
    initialSelectionState: {},
  });

  const [viewState, setViewState] = useState<ViewState>({
    length,
    viewBounds: [0, 1],
    viewport: { top: 0, left: 0, width: 800, height: 400 },
  });

  const ephemeralStateRef = useRef<EphemeralState>({});

  useEffect(() => {
    setViewState((state) => ({
      ...state,
      viewport: ref.current?.getBoundingClientRect()!,
    }));
  }, []);

  const render = (renderState: RenderState) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    renderGraphEditorWithRenderState(ctx, renderState);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const viewport = ref.current?.getBoundingClientRect();

    if (!viewport) {
      return;
    }

    const actionToPerform = getActionToPerformOnMouseDown({
      e,
      length,
      timelines: stateManager.getActionState().state.timelines,
      viewport,
    });

    if (actionToPerform.type !== "mousedown_keyframe") {
      return;
    }

    const { timelineId, keyframe } = actionToPerform;

    stateManager.requestAction((params) => {
      const actionState = stateManager.getActionState();

      const initialViewState = viewState;

      function ifNotDone<F extends (...args: any[]) => void>(callback: F) {
        return ((...args) => {
          if (params.done) {
            return;
          }
          return callback(...args);
        }) as F;
      }

      onMousedownKeyframe(
        {
          initialState: {
            primary: actionState.state,
            selection: actionState.selection,
            view: initialViewState,
          },

          onStateChange: {
            primary: ifNotDone((state) =>
              params.dispatch(timelineActions.setState(state))
            ),
            selection: ifNotDone((state) =>
              params.dispatch(timelineSelectionActions.setState(state))
            ),
            view: ifNotDone(setViewState),
            ephemeral: ifNotDone((state) => {
              ephemeralStateRef.current = state;
            }),
          },

          onSubmit: (options) => {
            const { name, allowSelectionShift } = options;
            params.submitAction({ name, allowSelectionShift });
          },

          onCancel: ifNotDone(() => {
            setViewState(initialViewState);
            params.cancelAction();
          }),

          render,
        },
        { e, keyframe, timelineId }
      );
    });
  };

  useLayoutEffect(() => {
    render({
      primary: state.state,
      selection: state.selection,
      view: viewState,
      ephemeral: {},
    });
  }, [state]);

  const stateRef = useRef(state);
  stateRef.current = state;

  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;

  useEffect(() => {
    const canvas = ref.current;

    if (!canvas) {
      return () => {};
    }

    const viewport = canvas.getBoundingClientRect();

    let lastPost: Vec2 | undefined;

    const renderCursor = () => {
      if (!lastPost) {
        return;
      }

      const viewportMousePosition = lastPost.subXY(viewport.left, viewport.top);

      let {
        state: { timelines },
        selection: timelineSelection,
      } = stateRef.current;
      const { viewBounds, length } = viewStateRef.current;
      const { yBounds, pan, keyframeShift } = ephemeralStateRef.current;

      if (keyframeShift) {
        timelines = mapMap(timelines, (timeline) =>
          applyTimelineKeyframeShift({
            timeline,
            timelineSelection: timelineSelection[timeline.id],
            keyframeShift,
          })
        );
      }

      const cursor = getGraphEditorCursor({
        timelines,
        length,
        viewBounds,
        viewport,
        viewportMousePosition,
        yBounds,
        pan,
      });
      canvas.style.cursor = cursor;
    };

    const mouseMoveListener = (e: MouseEvent) => {
      lastPost = Vec2.fromEvent(e);
      renderCursor();
    };

    const keyDownListener = (e: KeyboardEvent) => {
      if (!isKeyCodeOf("Alt", e.keyCode)) {
        return;
      }

      renderCursor();
    };

    canvas.addEventListener("mousemove", mouseMoveListener);
    window.addEventListener("keydown", keyDownListener);
    window.addEventListener("keyup", keyDownListener);

    return () => {
      canvas.removeEventListener("mousemove", mouseMoveListener);
      window.removeEventListener("keydown", keyDownListener);
      window.removeEventListener("keyup", keyDownListener);
    };
  }, []);

  return (
    <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />
  );
};
