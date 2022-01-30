import "./preventGlobals";

import { ComponentMeta } from "@storybook/react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { onMousedownKeyframe } from "~/core/handlers/mousedownKeyframe";
import { renderGraphEditorWithRenderState } from "~/core/render/renderGraphEditor";
import { RenderState, ViewState } from "~/core/state/stateTypes";
import {
  timelineReducer,
  TimelineState,
} from "~/core/state/timeline/timelineReducer";
import { timelineSelectionReducer } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { timelineActions } from "~/core/state/timeline/timelineActions";
import { timelineSelectionActions } from "~/core/state/timelineSelection/timelineSelectionActions";
import { useStateManager } from "~/core/state/StateManager/useStateManager";

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

          onSubmit: (options) => {
            const { name, state, allowSelectionShift } = options;

            params.dispatch(timelineActions.setState(state.primary));
            params.dispatch(timelineSelectionActions.setState(state.selection));
            setViewState(viewState);

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

  return (
    <canvas ref={ref} width={800} height={400} onMouseDown={onMouseDown} />
  );
};
