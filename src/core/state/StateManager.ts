import {
  addListener as _addListener,
  removeListener,
  removeListener as _removeListener,
} from "~/core/listener/addListener";
import { HistoryAction, historyActions } from "~/core/state/historyActions";
import {
  createInitialHistoryState,
  createReducerWithHistory,
  HistoryState,
} from "~/core/state/historyReducer";
import { Action } from "~/types/commonTypes";

type ActionState<T, S, TK extends string, SK extends string> = Record<TK, T> &
  Record<SK, S>;

interface Options<
  T,
  S,
  AT extends Action,
  AS extends Action,
  TK extends string,
  SK extends string
> {
  stateKey: TK;
  selectionStateKey: SK;

  initialState: T;
  initialSelectionState: S;

  reducer: (state: T, action: AT) => T;
  selectionReducer: (state: S, action: AS) => S;

  onStateChangeCallback?: (state: ActionState<T, S, TK, SK>) => void;
}

export type ShouldAddToStackFn = (
  prevState: unknown,
  nextState: unknown
) => boolean;

interface SubmitOptions {
  allowIndexShift: boolean;
  shouldAddToStack?: ShouldAddToStackFn;
}

export interface RequestActionParams {
  dispatch: (action: Action) => void;
  cancelAction: () => void;
  submitAction: (name?: string, options?: Partial<SubmitOptions>) => void;
  addListener: typeof _addListener;
  removeListener: typeof _removeListener;
  done: () => boolean;
  execOnComplete: (callback: () => void) => void;
}

export interface RequestActionCallback {
  (params: RequestActionParams): void;
}

interface RequestActionOptions {
  shouldAddToStack?: ShouldAddToStackFn | ShouldAddToStackFn[];
  beforeSubmit?: (params: RequestActionParams) => void;
}

export class StateManager<
  T,
  S,
  AT extends Action,
  AS extends Action,
  TK extends string,
  SK extends string
> {
  private stateKey: TK;
  private selectionStateKey: SK;

  private state: HistoryState<T>;
  private selectionState: HistoryState<S>;

  private onStateChangeCallback?: (state: ActionState<T, S, TK, SK>) => void;

  private reducer: (
    state: HistoryState<T>,
    action: HistoryAction
  ) => HistoryState<T>;
  private selectionReducer: (
    state: HistoryState<S>,
    action: HistoryAction
  ) => HistoryState<S>;

  private _n = 0;

  constructor(options: Options<T, S, AT, AS, TK, SK>) {
    this.state = createInitialHistoryState(options.initialState, "normal");
    this.selectionState = createInitialHistoryState(
      options.initialSelectionState,
      "selection"
    );

    this.reducer = createReducerWithHistory(options.reducer);
    this.selectionReducer = createReducerWithHistory(options.selectionReducer);

    this.stateKey = options.stateKey;
    this.selectionStateKey = options.selectionStateKey;

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
    const { shouldAddToStack, beforeSubmit } = options;

    const actionId = (++this._n).toString();
    const cancelTokens: string[] = [];

    const done = () => actionId !== this.getActionId();

    const addListener = Object.keys(_addListener).reduce<typeof _addListener>(
      (obj, key) => {
        (obj as any)[key] = (...args: any[]) => {
          if (done()) {
            return;
          }

          const cancelToken = (_addListener as any)[key](...args);
          cancelTokens.push(cancelToken);
          return cancelToken;
        };
        return obj;
      },
      {} as any
    );

    let onCompleteCallback: (() => void) | null = null;

    const onComplete = () => {
      cancelTokens.forEach((cancelToken) => removeListener(cancelToken));

      if (onCompleteCallback) {
        onCompleteCallback();
      }
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

    this.dispatchHistoryAction(historyActions.startAction(actionId));

    if (typeof window !== "undefined") {
      // Likely running inside of Jest
      const escToken = addListener.keyboardOnce("Esc", "keydown", cancelAction);
      cancelTokens.push(escToken);
    }

    const params: RequestActionParams = {
      done,

      dispatch,

      submitAction: (name = "Unknown action", options = {}) => {
        const { allowIndexShift = false } = options;

        if (!this.getActionId()) {
          console.warn("Attempted to submit an action that does not exist.");
          return;
        }

        if (this.getActionId() !== actionId) {
          console.warn("Attempted to submit with the wrong action id.");
          return;
        }

        const shouldAddToStackFns: ShouldAddToStackFn[] = [];

        if (Array.isArray(shouldAddToStack)) {
          shouldAddToStackFns.push(...shouldAddToStack);
        } else if (typeof shouldAddToStack === "function") {
          shouldAddToStackFns.push(shouldAddToStack);
        }

        if (options.shouldAddToStack) {
          shouldAddToStackFns.push(options.shouldAddToStack);
        }

        let addToStack = shouldAddToStackFns.length === 0;

        for (const shouldAddToStack of shouldAddToStackFns) {
          if (shouldAddToStack(this.getCurrentState(), this.getActionState())) {
            addToStack = true;
          }
        }

        if (!addToStack) {
          this.dispatchHistoryAction(historyActions.cancelAction(actionId));
          onComplete();
          return;
        }

        if (beforeSubmit) {
          beforeSubmit(params);
        }

        const modifiedKeys: Array<TK | SK> = [];
        {
          if (
            this.state.action!.state !== this.state.list[this.state.index].state
          ) {
            modifiedKeys.push(this.stateKey);
          }
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
            allowIndexShift
          )
        );
        onComplete();
      },

      cancelAction,

      addListener,

      removeListener,

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

  public getActionState(): ActionState<T, S, TK, SK> {
    type AS = ActionState<T, S, TK, SK>;

    const out = {} as AS;

    if (this.state.action && this.selectionState.action) {
      out[this.stateKey] = this.state.action.state as AS[TK];
      out[this.selectionStateKey] = this.selectionState.action.state as AS[SK];
    } else {
      const s = this.selectionState;

      const shiftForward =
        s.type === "selection" &&
        s.indexDirection === -1 &&
        s.list[s.index + 1].modifiedRelated &&
        s.list[s.index + 1].allowIndexShift;

      out[this.stateKey] = this.state.list[this.state.index].state as AS[TK];
      out[this.selectionStateKey] = s.list[s.index + (shiftForward ? 1 : 0)]
        .state as AS[SK];
    }

    return out;
  }

  public getCurrentState(): ActionState<T, S, TK, SK> {
    type AS = ActionState<T, S, TK, SK>;

    const out = {} as AS;

    out[this.stateKey] = this.state.list[this.state.index].state as AS[TK];
    out[this.selectionStateKey] = this.selectionState.list[
      this.selectionState.index
    ].state as AS[SK];

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
