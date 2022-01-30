import {
  HistoryAction,
  historyActions,
} from "~/core/state/StateManager/history/historyActions";
import {
  createInitialHistoryState,
  createReducerWithHistory,
  HistoryState,
} from "~/core/state/StateManager/history/historyReducer";
import { Action } from "~/types/commonTypes";

type ActionState<T, S> = {
  state: T;
  selection: S;
};

export interface StateManagerOptions<
  T,
  S,
  AT extends Action,
  AS extends Action
> {
  initialState: T;
  initialSelectionState: S;

  reducer: (state: T, action: AT) => T;
  selectionReducer: (state: S, action: AS) => S;

  onStateChangeCallback?: (state: ActionState<T, S>) => void;
}

interface SubmitOptions {
  name: string;
  allowSelectionShift?: boolean;
}

export interface RequestActionParams {
  dispatch: (action: Action) => void;
  cancelAction: () => void;
  submitAction: (options: SubmitOptions) => void;
  done: boolean;
  execOnComplete: (callback: () => void) => void;
}

export interface RequestActionCallback {
  (params: RequestActionParams): void;
}

interface RequestActionOptions {
  beforeSubmit?: (params: RequestActionParams) => void;
}

export class StateManager<T, S, AT extends Action, AS extends Action> {
  private state: HistoryState<T>;
  private selectionState: HistoryState<S>;

  private onStateChangeCallback?: (state: ActionState<T, S>) => void;

  private reducer: (
    state: HistoryState<T>,
    action: HistoryAction
  ) => HistoryState<T>;
  private selectionReducer: (
    state: HistoryState<S>,
    action: HistoryAction
  ) => HistoryState<S>;

  private _n = 0;

  constructor(options: StateManagerOptions<T, S, AT, AS>) {
    this.state = createInitialHistoryState(options.initialState, "normal");
    this.selectionState = createInitialHistoryState(
      options.initialSelectionState,
      "selection"
    );

    this.reducer = createReducerWithHistory(options.reducer);
    this.selectionReducer = createReducerWithHistory(options.selectionReducer);

    this.onStateChangeCallback = options.onStateChangeCallback;
  }

  private onStateChange() {
    this.onStateChangeCallback?.(this.getActionState());
  }

  private getActionId(): string | undefined {
    return this.state.action?.id;
  }

  private performRequestedAction(
    options: RequestActionOptions,
    callback: RequestActionCallback
  ) {
    const { beforeSubmit } = options;

    const actionId = (++this._n).toString();

    const done = () => actionId !== this.getActionId();

    let onCompleteCallback: (() => void) | null = null;

    const onComplete = () => {
      window.removeEventListener("keydown", escListener);
      onCompleteCallback?.();
    };

    const dispatch: RequestActionParams["dispatch"] = (action) => {
      this.dispatchHistoryAction(
        historyActions.dispatchToAction(actionId, action, true)
      );
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

    const params: RequestActionParams = {
      get done() {
        return done();
      },

      dispatch,

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

        if (beforeSubmit) {
          beforeSubmit(params);
        }

        const modifiedState =
          this.state.action!.state !== this.state.list[this.state.index].state;
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
            allowSelectionShift
          )
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

  public requestAction(callback: RequestActionCallback): void;
  public requestAction(
    options: RequestActionOptions,
    callback: RequestActionCallback
  ): void;
  public requestAction(
    optionsOrCallback: RequestActionOptions | RequestActionCallback,
    callback?: RequestActionCallback
  ): void {
    let options: RequestActionOptions;
    let cb: RequestActionCallback;

    if (typeof optionsOrCallback === "function") {
      options = {};
      cb = optionsOrCallback;
    } else {
      options = optionsOrCallback;
      cb = callback!;
    }

    if (!this.getActionId()) {
      this.performRequestedAction(options, cb);
      return;
    }

    requestAnimationFrame(() => {
      if (!this.getActionId()) {
        this.performRequestedAction(options, cb);
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
}
