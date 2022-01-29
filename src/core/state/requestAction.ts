import { addListener as _addListener, removeListener as _removeListener } from "~/core/listener/addListener";
import { Action } from "~/types/commonTypes";

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

let _n = 0;
let _actionId: string | null;

const getActionId = () => _actionId;

const performRequestedAction = (
  options: RequestActionOptions,
  callback: RequestActionCallback
) => {
  const { shouldAddToStack, beforeSubmit } = options;

  const actionId = (++_n).toString();
  _actionId = actionId;
  
  const cancelTokens: string[] = [];

  const done = () => actionId !== getActionId();

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
    cancelTokens.forEach((cancelToken) => _removeListener(cancelToken));

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

      if (!getActionId()) {
        console.warn("Attempted to submit an action that does not exist.");
        return;
      }

      if (getActionId() !== actionId) {
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

    removeListener: _removeListener,

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

  if (!getActionId()) {
    this.performRequestedAction(options, cb);
    return;
  }

  requestAnimationFrame(() => {
    if (!getActionId()) {
      this.performRequestedAction(options, cb);
      return;
    }
  });
}