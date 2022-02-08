import React, { useCallback, useMemo, useRef, useState } from "react";
import { attachHandlers } from "~/core/handlers/attachHandlers";
import { renderGraphEditorWithRenderState } from "~/core/render/renderGraphEditor";
import { StateManager } from "~/core/state/StateManager/StateManager";
import { useStateManager } from "~/core/state/StateManager/useStateManager";
import {
  ActionOptions,
  RenderState,
  SelectionState,
  TrackedState,
  ViewState,
} from "~/core/state/stateTypes";
import { timelineActions } from "~/core/state/timeline/timelineActions";
import { timelineReducer, TimelineState } from "~/core/state/timeline/timelineReducer";
import { timelineSelectionActions } from "~/core/state/timelineSelection/timelineSelectionActions";
import {
  timelineSelectionReducer,
  TimelineSelectionState,
} from "~/core/state/timelineSelection/timelineSelectionReducer";
import { useIsomorphicLayoutEffect } from "~/core/utils/hook/useIsomorphicLayoutEffect";
import { useRefRect } from "~/core/utils/hook/useRefRect";
import { useRenderCursor } from "~/core/utils/hook/useRenderCursor";
import { TimelineAction, TimelineSelectionAction } from "~/types/reducerTypes";
import { TimelineMap } from "~/types/timelineTypes";

interface UseTimelinesResult {
  getState: () => TrackedState;
  requestAction: (callback: (actionOptions: ActionOptions) => void) => void;
  view: ViewState;
  setView: (view: Partial<ViewState>) => void;
  timelines: TimelineMap;
  selection: SelectionState;
  stateManager: StateManager<
    TimelineState,
    TimelineSelectionState,
    TimelineAction,
    TimelineSelectionAction
  >;
  canvasRef: React.Ref<HTMLCanvasElement>;
}

interface Options {
  initialState: TimelineState;
  initialSelectionState?: TimelineSelectionState;
}

export const useTimelines = (props: Options) => {
  const { state, stateManager } = useStateManager({
    initialState: props.initialState,
    initialSelectionState: props.initialSelectionState || {},

    reducer: timelineReducer,
    selectionReducer: timelineSelectionReducer,
  });

  const [view, setView] = useState<ViewState>({
    allowExceedViewBounds: true,
    length: 120,
    viewBounds: [0, 1],
    viewBoundsHeight: 24,
    viewport: null!,
  });

  const viewRef = useRef(view);
  viewRef.current = view;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRect = useRefRect(canvasRef);

  const { renderCursor } = useRenderCursor({
    canvasRef,
    getRenderState: () => renderStateRef.current,
  });

  const render = (renderState: RenderState) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) {
      return;
    }
    renderGraphEditorWithRenderState(ctx, renderState);
    renderCursor(renderState);
  };

  useIsomorphicLayoutEffect(() => {
    if (!view.viewport) {
      return;
    }

    // Always render on mount and when the state in the store changes. This covers:
    //
    //  - The initial render
    //  - Undo and Redo
    //
    // The `onStateChange.render` handler covers rendering during actions.
    //
    render(renderStateRef.current);
    renderCursor(renderStateRef.current);
  }, [state, view]);

  useIsomorphicLayoutEffect(() => {
    if (!canvasRect) {
      return;
    }
    setView((view) => ({ ...view, viewport: canvasRect }));
    canvasRef.current!.width = canvasRect.width;
    canvasRef.current!.height = canvasRect.height;
  }, [canvasRect]);

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
  renderStateRef.current = getRenderState();

  const requestAction = useCallback((callback: (actionOptions: ActionOptions) => void) => {
    stateManager.requestAction((params) => {
      const actionState = stateManager.getActionState();

      const initialViewState = viewRef.current;

      function ifNotDone<F extends (...args: any[]) => void>(callback: F) {
        return ((...args) => {
          if (params.done) {
            return;
          }
          return callback(...args);
        }) as F;
      }

      const actionOptions: ActionOptions = {
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
          setView(state.view);
          params.submitAction({ name, allowSelectionShift });
        },
        onSubmitView: ({ viewState }) => {
          setView(viewState);
          params.cancelAction();
        },

        onCancel: ifNotDone(() => {
          setView(initialViewState);
          params.cancelAction();
        }),

        render,
      };
      callback(actionOptions);
    });
  }, []);

  const getState = useCallback(() => renderStateRef.current, []);

  const detachRef = useRef<(() => void) | null>(null);

  const onCanvasOrNull = useCallback((el: HTMLCanvasElement | null): void => {
    canvasRef.current = el;

    if (!el) {
      detachRef.current?.(); // Detach if listeners have been attached
      return;
    }

    const { detach } = attachHandlers({ el, requestAction, getState });
    detachRef.current = detach;
  }, []);

  const setPartialView = useCallback((partialView: Partial<ViewState>) => {
    setView((view) => ({ ...view, ...partialView }));
  }, []);

  const value = useMemo((): UseTimelinesResult => {
    return {
      getState,
      requestAction,
      view,
      setView: setPartialView,
      timelines: state.state.timelines,
      selection: state.selection,
      stateManager,
      canvasRef: onCanvasOrNull,
    };
  }, [state, view]);

  return value;
};
