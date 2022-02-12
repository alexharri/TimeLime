import React, { useCallback, useMemo, useRef } from "react";
import { attachHandlers } from "~/core/handlers/attachHandlers";
import { renderGraphEditorWithRenderState } from "~/core/render/renderGraphEditor";
import { StateManager } from "~/core/state/StateManager/StateManager";
import { useStateManager } from "~/core/state/StateManager/useStateManager";
import { ActionOptions, RenderState, TrackedState, ViewState } from "~/core/state/stateTypes";
import { TimelineState } from "~/core/state/timeline/timelineReducer";
import { TimelineSelectionState } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { useIsomorphicLayoutEffect } from "~/core/utils/hook/useIsomorphicLayoutEffect";
import { useRefRect } from "~/core/utils/hook/useRefRect";
import { useRenderCursor } from "~/core/utils/hook/useRenderCursor";
import { TimelineStateProvider } from "~/react/TimelineStateProvider";

interface UseTimelineStateResult {
  getState: () => TrackedState;
  requestAction: (callback: (actionOptions: ActionOptions) => void) => void;
  stateManager: StateManager<TimelineState, TimelineSelectionState>;
  canvasRef: React.Ref<HTMLCanvasElement>;
  Provider: React.ComponentType;
}

interface Options {
  length: number;
  initialState: TimelineState;
  initialSelectionState?: TimelineSelectionState;
}

export const useTimelineState = (options: Options) => {
  const { state, stateManager } = useStateManager({
    initialState: options.initialState,
    initialSelectionState: options.initialSelectionState || {},
  });

  const viewRef = useRef<ViewState>({
    allowExceedViewBounds: true,
    length: options.length,
    viewBounds: [0, 1],
    viewBoundsHeight: 16,
    scrubberHeight: 20,
    frameIndex: 33,
    viewport: null!,
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
  renderStateRef.current = getRenderState();

  const setViewState = useCallback((partialViewState: Partial<ViewState>) => {
    viewRef.current = { ...viewRef.current, ...partialViewState };
    renderStateRef.current = getRenderState();
  }, []);

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
    if (!canvasRect) {
      return;
    }
    setViewState({ viewport: canvasRect });
    canvasRef.current!.width = canvasRect.width;
    canvasRef.current!.height = canvasRect.height;
  }, [canvasRect]);

  useIsomorphicLayoutEffect(() => {
    if (!viewRef.current.viewport) {
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
  }, [state, canvasRect]);

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
          params.setState(state.primary);
          params.setSelection(state.selection);
          setViewState(state.view);
          params.submitAction({ name, allowSelectionShift });
        },
        onSubmitView: ({ viewState }) => {
          setViewState(viewState);
          params.cancelAction();
        },

        onCancel: ifNotDone(() => {
          setViewState(initialViewState);
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

  const setLength = useCallback((length: number) => {
    stateManager.requestAction((params) => {
      const { view } = renderStateRef.current;
      const t = view.length / length;
      const [low, high] = view.viewBounds.map((x) => x * t);
      setViewState({ length, viewBounds: [low, high] });
      params.cancelAction();
    });
  }, []);

  const Provider = useMemo(() => {
    const Provider: React.FC = (props) => {
      return (
        <TimelineStateProvider renderStateRef={renderStateRef} setLength={setLength}>
          {props.children}
        </TimelineStateProvider>
      );
    };
    return Provider;
  }, []);

  const value = useMemo((): UseTimelineStateResult => {
    return {
      Provider,
      getState,
      requestAction,
      stateManager,
      canvasRef: onCanvasOrNull,
    };
  }, [state]);

  return value;
};
