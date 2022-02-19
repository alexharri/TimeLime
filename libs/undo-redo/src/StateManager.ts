import { HistoryAction, historyActions } from "~undo-redo/history/historyActions";
import {
  createInitialHistoryState,
  createReducerWithHistory,
  HistoryState,
} from "~undo-redo/history/historyReducer";

export type ActionState<T, S> = {
  state: T;
  selection: S;
};

export interface StateManagerOptions<T, S> {
  initialState: T;
  initialSelectionState: S;

  onStateChangeCallback?: (state: ActionState<T, S>) => void;
}

interface SubmitOptions {
  name: string;
  allowSelectionShift?: boolean;
}

export interface RequestActionParams<T, S> {
  setState: (state: T) => void;
  setSelection: (state: S) => void;
  cancelAction: () => void;
  submitAction: (options: SubmitOptions) => void;
  done: boolean;
  execOnComplete: (callback: () => void) => void;
}

export interface RequestActionCallback<T, S> {
  (params: RequestActionParams<T, S>): void;
}

export class StateManager<T, S> {
  private state: HistoryState<T>;
  private selectionState: HistoryState<S>;

  private onStateChangeCallback?: (state: ActionState<T, S>) => void;

  private reducer: (state: HistoryState<T>, action: HistoryAction) => HistoryState<T>;
  private selectionReducer: (state: HistoryState<S>, action: HistoryAction) => HistoryState<S>;

  private listenerId = 0;
  private listeners: Array<{ id: number; callback: (state: ActionState<T, S>) => void }> = [];

  private _n = 0;

  constructor(options: StateManagerOptions<T, S>) {
    this.state = createInitialHistoryState(options.initialState, "normal");
    this.selectionState = createInitialHistoryState(options.initialSelectionState, "selection");

    this.reducer = createReducerWithHistory();
    this.selectionReducer = createReducerWithHistory();

    this.onStateChangeCallback = options.onStateChangeCallback;
    this.isActionInProgress = this.isActionInProgress.bind(this);
  }

  private onStateChange() {
    const actionState = this.getActionState();
    this.onStateChangeCallback?.(actionState);
    try {
      for (const { callback } of this.listeners) {
        callback(actionState);
      }
    } catch (e) {
      console.log(e);
    }
  }

  private getActionId(): string | undefined {
    return this.state.action?.id;
  }

  private performRequestedAction(callback: RequestActionCallback<T, S>) {
    const actionId = (++this._n).toString();

    const done = () => actionId !== this.getActionId();

    let onCompleteCallback: (() => void) | null = null;

    const onComplete = () => {
      if (typeof window !== "undefined") {
        // Likely running inside of Jest
        window.removeEventListener("keydown", escListener);
      }
      onCompleteCallback?.();
    };

    const setState = (state: T) => {
      this.state = this.reducer(this.state, historyActions.setActionState(actionId, state, true));
      this.onStateChange();
    };
    const setSelection = (state: S) => {
      this.selectionState = this.selectionReducer(
        this.selectionState,
        historyActions.setActionState(actionId, state, true),
      );
      this.onStateChange();
    };

    const cancelAction = () => {
      this.dispatchHistoryAction(historyActions.cancelAction(actionId));
      onComplete();
    };

    function escListener(e: KeyboardEvent) {
      if (e.keyCode !== 27) {
        return;
      }
      cancelAction();
    }

    this.dispatchHistoryAction(historyActions.startAction(actionId));

    if (typeof window !== "undefined") {
      // Likely running inside of Jest
      window.addEventListener("keydown", escListener);
    }

    const params: RequestActionParams<T, S> = {
      get done() {
        return done();
      },

      setState,
      setSelection,

      submitAction: (options) => {
        const { name, allowSelectionShift = false } = options;

        if (!this.getActionId()) {
          console.warn("Attempted to submit an action that does not exist.");
          return;
        }

        if (this.getActionId() !== actionId) {
          console.warn("Attempted to submit with the wrong action id.");
          return;
        }

        const modifiedState = this.state.action!.state !== this.state.list[this.state.index].state;
        const modifiedSelectionState =
          this.selectionState.action!.state !==
          this.selectionState.list[this.selectionState.index].state;

        this.dispatchHistoryAction(
          historyActions.submitAction(
            actionId,
            name,
            true,
            modifiedState,
            modifiedSelectionState,
            allowSelectionShift,
          ),
        );
        onComplete();
      },

      cancelAction,

      execOnComplete: (cb) => {
        onCompleteCallback = cb;
      },
    };

    callback(params);
  }

  public isActionInProgress() {
    return !!this.getActionId();
  }

  public requestAction(callback: RequestActionCallback<T, S>): void {
    if (!this.getActionId()) {
      this.performRequestedAction(callback);
      return;
    }

    requestAnimationFrame(() => {
      if (!this.getActionId()) {
        this.performRequestedAction(callback);
        return;
      }
    });
  }

  public getActionState(): ActionState<T, S> {
    if (this.state.action && this.selectionState.action) {
      const out = {} as ActionState<T, S>;
      out.state = this.state.action.state;
      out.selection = this.selectionState.action.state;
      return out;
    }

    return this.getCurrentState();
  }

  public getCurrentState(): ActionState<T, S> {
    const out = {} as ActionState<T, S>;

    const s = this.selectionState;

    const shiftForward =
      s.type === "selection" &&
      s.indexDirection === -1 &&
      s.list[s.index + 1].modifiedRelated &&
      s.list[s.index + 1].allowIndexShift;

    out.state = this.state.list[this.state.index].state;
    out.selection = s.list[s.index + (shiftForward ? 1 : 0)].state;

    return out;
  }

  private dispatchHistoryAction(action: HistoryAction) {
    this.state = this.reducer(this.state, action);
    this.selectionState = this.selectionReducer(this.selectionState, action);
    this.onStateChange();
  }

  public redo() {
    const state = this.state;

    if (state.preferredRedo) {
      this.dispatchHistoryAction(historyActions.restorePreferredRedo());
      return;
    }

    if (state.index === state.list.length - 1) {
      // Nothing to redo.
      return;
    }

    const nextIndex = state.index + 1;
    this.dispatchHistoryAction(historyActions.setHistoryIndex(nextIndex));
  }

  public undo() {
    const state = this.state;
    if (state.index === 0) {
      // Nothing to undo.
      return;
    }

    const nextIndex = state.index - 1;
    this.dispatchHistoryAction(historyActions.setHistoryIndex(nextIndex));
  }

  public subscribe(callback: (state: ActionState<T, S>) => void) {
    const id = ++this.listenerId;
    this.listeners.push({ callback, id });

    return {
      unsubscribe: () => {
        const index = this.listeners.findIndex((listener) => listener.id === id);
        if (index === -1) {
          return;
        }
        this.listeners.splice(index, 1);
      },
    };
  }
}
