import { mapMap } from "map-fns";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { attachHandlers, isKeyCodeOf, renderGraphEditorWithRenderState } from "timelime/core";
import {
  ActionOptions,
  PrimaryState,
  RenderState,
  SelectionState,
  TimelineSelection,
  TimelineSelectionState,
  TimelineState,
  ViewState,
} from "timelime/types";
import { RequestActionParams, StateManager } from "timelime/undo-redo";
import { useIsomorphicLayoutEffect } from "~react/hook/useIsomorphicLayoutEffect";
import { useRefRect } from "~react/hook/useRefRect";
import { useRenderCursor } from "~react/hook/useRenderCursor";
import { TimelineStateProvider } from "~react/TimelineStateProvider";
import { GraphEditorProps } from "~react/types";

interface UseTimelineStateResult {
  Provider: React.ComponentType;
  GraphEditor: React.ComponentType<GraphEditorProps>;
}

interface Options {
  length: number;
  initialState: TimelineState;
  initialSelectionState?: TimelineSelectionState;
}

export const useTimelineState = (options: Options) => {
  const stateManager = useMemo(() => {
    return new StateManager<PrimaryState, SelectionState>({
      initialState: options.initialState,
      initialSelectionState:
        options.initialSelectionState ||
        mapMap(options.initialState.timelines, (): TimelineSelection => ({ keyframes: {} })),
    });
  }, []);

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
    render(renderStateRef.current);
    renderCursor(renderStateRef.current);
  }, []);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasRect = useRefRect(canvasContainerRef);

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

  // Listen to undo/redo
  useEffect(() => {
    const update = () => {
      renderStateRef.current = getRenderState();
      render(renderStateRef.current);
      renderCursor(renderStateRef.current);
    };

    const listener = (e: KeyboardEvent) => {
      if (isKeyCodeOf("Z", e.keyCode) && e.metaKey && e.shiftKey) {
        stateManager.redo();
        update();
        return;
      }
      if (isKeyCodeOf("Z", e.keyCode) && e.metaKey) {
        stateManager.undo();
        update();
        return;
      }
    };

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

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
  }, [canvasRect]);

  const actionOptionFactory = useCallback(
    (params: RequestActionParams<TimelineState, TimelineSelectionState>) => {
      const actionState = stateManager.getActionState();
      const initialViewState = viewRef.current;

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

        onCancel: () => {
          setViewState(initialViewState);
          params.cancelAction();
        },

        render,
      };
      return actionOptions;
    },
    [],
  );

  const getActionOptions = useCallback((callback: (actionOptions: ActionOptions) => void) => {
    stateManager.requestAction((params) => {
      const actionOptions = actionOptionFactory(params);
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

    const { detach } = attachHandlers({ el, getActionOptions, getState });
    detachRef.current = detach;
  }, []);

  const setLength = useCallback((length: number) => {
    // We request an action even if we're not modifying tracked state to ensure
    // that we're not triggering parallel actions.
    stateManager.requestAction((params) => {
      const { view } = renderStateRef.current;
      const t = view.length / length;
      const [low, high] = view.viewBounds.map((x) => x * t);
      setViewState({ length, viewBounds: [low, high] });
      params.cancelAction();
    });
  }, []);

  const GraphEditor = useMemo(() => {
    return (props: GraphEditorProps) => (
      <div
        style={
          props.behavior === "absolute"
            ? { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }
            : { height: props.height ?? 400 }
        }
        ref={canvasContainerRef}
      >
        <canvas ref={onCanvasOrNull} />
      </div>
    );
  }, []);

  const Provider = useMemo(() => {
    const Provider: React.FC = (props) => {
      return (
        <TimelineStateProvider
          renderStateRef={renderStateRef}
          setLength={setLength}
          getActionOptions={getActionOptions}
          GraphEditor={GraphEditor}
        >
          {props.children}
        </TimelineStateProvider>
      );
    };
    return Provider;
  }, []);

  const value = useMemo((): UseTimelineStateResult => {
    return {
      Provider,
      GraphEditor,
    };
  }, []);

  return value;
};
