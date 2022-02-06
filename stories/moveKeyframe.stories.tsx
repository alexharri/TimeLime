import "./preventGlobals";

import { ComponentMeta } from "@storybook/react";
import React, { useEffect, useRef } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { onMousedownKeyframe } from "~/core/handlers/mousedownKeyframe";
import { renderGraphEditorWithRenderState } from "~/core/render/renderGraphEditor";
import { ActionOptions, RenderState, ViewState } from "~/core/state/stateTypes";
import { timelineReducer, TimelineState } from "~/core/state/timeline/timelineReducer";
import { timelineSelectionReducer } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { timelineActions } from "~/core/state/timeline/timelineActions";
import { timelineSelectionActions } from "~/core/state/timelineSelection/timelineSelectionActions";
import { useStateManager } from "~/core/state/StateManager/useStateManager";
import { RequestActionParams } from "~/core/state/StateManager/StateManager";
import { onPan } from "~/core/handlers/pan/pan";
import { onZoom } from "~/core/handlers/zoom";
import { useIsomorphicLayoutEffect } from "~/core/utils/hook/useIsomorphicLayoutEffect";
import { useRenderCursor } from "~/core/utils/hook/useRenderCursor";
import { onMousedownControlPoint } from "~/core/handlers/mousedownControlPoint";
import { onMousedownEmpty } from "~/core/handlers/mousedownEmpty";
import { onAltMousedownKeyframe } from "~/core/handlers/altMousedownKeyframe";

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
          [140, 120],
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
    allowExceedViewBounds: true,
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

  const render = (renderState: RenderState) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    renderGraphEditorWithRenderState(ctx, renderState);
    renderCursor(renderState);
  };

  const renderStateRef = useRef(getRenderState());
  renderStateRef.current = getRenderState();

  useEffect(() => {
    // Set the correct viewport on mount.
    viewRef.current.viewport = ref.current?.getBoundingClientRect()!;
  }, []);

  const { renderCursor } = useRenderCursor({
    canvasRef: ref,
    getRenderState: () => renderStateRef.current,
  });

  useIsomorphicLayoutEffect(() => {
    // Always render on mount and when the state in the store changes. This covers:
    //
    //  - The initial render
    //  - Undo and Redo
    //
    // The `onStateChange.render` handler covers rendering during actions.
    //
    render(renderStateRef.current);
    renderCursor(renderStateRef.current);
  }, [state]);

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
    const { viewport, viewBounds, length } = viewRef.current;

    const actionToPerform = getActionToPerformOnMouseDown({
      e,
      length,
      timelines: stateManager.getActionState().state.timelines,
      viewport,
      viewBounds,
    });

    switch (actionToPerform.type) {
      case "mousedown_empty": {
        stateManager.requestAction((params) => {
          const actionOptions = createActionOptions(params);
          onMousedownEmpty(actionOptions, { e, ...actionToPerform });
        });
        break;
      }
      case "mousedown_keyframe": {
        stateManager.requestAction((params) => {
          const actionOptions = createActionOptions(params);
          onMousedownKeyframe(actionOptions, { e, ...actionToPerform });
        });
        break;
      }
      case "alt_mousedown_keyframe": {
        stateManager.requestAction((params) => {
          const actionOptions = createActionOptions(params);
          onAltMousedownKeyframe(actionOptions, { e, ...actionToPerform });
        });
        break;
      }
      case "mousedown_control_point": {
        stateManager.requestAction((params) => {
          const actionOptions = createActionOptions(params);
          onMousedownControlPoint(actionOptions, { e, ...actionToPerform });
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

  return <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />;
};
