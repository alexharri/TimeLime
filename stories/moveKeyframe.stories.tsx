import "./preventGlobals";

import { ComponentMeta } from "@storybook/react";
import React, { useEffect, useLayoutEffect, useRef } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { onMousedownKeyframe } from "~/core/handlers/mousedownKeyframe";
import { renderGraphEditorWithRenderState } from "~/core/render/renderGraphEditor";
import { ActionOptions, RenderState, ViewState } from "~/core/state/stateTypes";
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
import { isKeyCodeOf } from "~/core/listener/keyboard";
import { RequestActionParams } from "~/core/state/StateManager/StateManager";
import { onPan } from "~/core/handlers/pan";
import { onZoom } from "~/core/handlers/zoom";

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

  const viewRef = useRef<ViewState>({
    length,
    viewBounds: [0, 1],
    viewport: { top: 0, left: 0, width: 800, height: 400 },
  });

  const getRenderState = (): RenderState => {
    const actionState = stateManager.getActionState();
    return {
      primary: actionState.state,
      selection: actionState.selection,
      view: viewRef.current,
      ephemeral: {},
    };
  };

  const renderStateRef = useRef(getRenderState());

  useEffect(() => {
    viewRef.current.viewport = ref.current?.getBoundingClientRect()!;
  }, []);

  const render = (renderState: RenderState) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    renderGraphEditorWithRenderState(ctx, renderState);
  };

  const createActionOptions = (params: RequestActionParams): ActionOptions => {
    const actionState = stateManager.getActionState();

    const initialViewState = { ...viewRef.current };

    function ifNotDone<F extends (...args: any[]) => void>(callback: F) {
      return ((...args) => {
        if (params.done) {
          return;
        }
        return callback(...args);
      }) as F;
    }

    return {
      initialState: {
        primary: actionState.state,
        selection: actionState.selection,
        view: initialViewState,
      },

      onStateChange: {
        render: (renderState) => {
          renderStateRef.current = renderState;
        },
      },

      onSubmit: (options) => {
        const { name, allowSelectionShift, state } = options;
        params.dispatch(timelineActions.setState(state.primary));
        params.dispatch(timelineSelectionActions.setState(state.selection));
        viewRef.current = state.view;
        params.submitAction({ name, allowSelectionShift });
      },

      onCancel: ifNotDone(() => {
        viewRef.current = initialViewState;
        params.cancelAction();
      }),

      render,
    };
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

    switch (actionToPerform.type) {
      case "mousedown_keyframe": {
        stateManager.requestAction((params) => {
          const actionOptions = createActionOptions(params);
          onMousedownKeyframe(actionOptions, { e, ...actionToPerform });
        });
        break;
      }
      case "pan": {
        stateManager.requestAction((params) => {
          onPan(createActionOptions(params), { e });
        });
        break;
      }
      case "zoom_out":
      case "zoom_in": {
        stateManager.requestAction((params) => {
          onZoom(createActionOptions(params), { ...actionToPerform, e });
        });
        break;
      }
    }
    if (actionToPerform.type !== "mousedown_keyframe") {
      return;
    }
  };

  useLayoutEffect(() => render(getRenderState()), [state]);

  useEffect(() => {
    const canvas = ref.current;

    if (!canvas) {
      return () => {};
    }

    let lastPost: Vec2 | undefined;

    const renderCursor = () => {
      if (!lastPost) {
        return;
      }

      const renderState = renderStateRef.current;
      const cursor = getGraphEditorCursor(lastPost, renderState);
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
