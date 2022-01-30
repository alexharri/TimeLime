import {
  addListener as _addListener,
  removeListener as _removeListener,
} from "~/core/listener/addListener";
import { ephemeralActions } from "~/core/state/ephemeral/ephemeralActions";
import { ephemeralReducer } from "~/core/state/ephemeral/ephemeralReducer";
import {
  EphemeralState,
  ActionOptions,
  PrimaryState,
  SelectionState,
  TrackedState,
  ViewState,
} from "~/core/state/stateTypes";
import { viewActions } from "~/core/state/view/viewActions";
import { viewReducer } from "~/core/state/view/viewReducer";
import { timelineActions } from "~/core/state/timeline/timelineActions";
import { timelineReducer } from "~/core/state/timeline/timelineReducer";
import { timelineSelectionActions } from "~/core/timelineSelectionActions";
import { timelineSelectionReducer } from "~/core/timelineSelectionReducer";
import { ActionCollection, ActionsReturnType } from "~/types/commonTypes";

export type ShouldAddToStackFn = (
  prevState: TrackedState,
  nextState: TrackedState
) => boolean;

interface SubmitOptions {
  name: string;
  allowSelectionShift?: boolean;
  shouldAddToStack?: ShouldAddToStackFn;
}

type SomeState<T, A extends ActionCollection> = {
  state: T;
  dispatch: (callback: (actions: A) => ActionsReturnType<A>) => void;
  reset: () => void;
};

export interface RequestActionParams {
  primary: SomeState<PrimaryState, typeof timelineActions>;
  selection: SomeState<SelectionState, typeof timelineSelectionActions>;
  view: SomeState<ViewState, typeof viewActions>;
  ephemeral: SomeState<EphemeralState, typeof ephemeralActions>;

  cancel: () => void;
  submit: (options: SubmitOptions) => void;
  addListener: typeof _addListener;
  removeListener: typeof _removeListener;
  done: () => boolean;
  execOnComplete: (callback: () => void) => void;
}

export interface RequestActionCallback {
  (params: RequestActionParams): void;
}

interface RequestActionOptions {
  userActionOptions: ActionOptions;
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
  const { shouldAddToStack, beforeSubmit, userActionOptions } = options;

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

    _actionId = null;
  };

  interface CreateStateManagerOptions<T, A extends ActionCollection> {
    initialState: T;
    reducer: (state: T, action: ActionsReturnType<A>) => T;
    actions: A;
    onChange: (state: T) => void;
  }

  const createStateManager = <T, A extends ActionCollection>(
    options: CreateStateManagerOptions<T, A>
  ): SomeState<T, A> => {
    const obj: SomeState<T, A> = {
      state: options.initialState,
      dispatch: (callback) => {
        const nextState = options.reducer(obj.state, callback(options.actions));
        onStateChange(nextState);
      },
      reset: () => onStateChange(options.initialState),
    };

    function onStateChange(state: T) {
      obj.state = state;
      options.onChange(state);
    }

    return obj;
  };

  const initialPrimaryState = options.userActionOptions.primary;
  const initialSelectionState = options.userActionOptions.selection;
  const initialViewState = options.userActionOptions.view;
  const initialEphemeralState = {};

  const primary = createStateManager({
    initialState: initialPrimaryState,
    actions: timelineActions,
    reducer: timelineReducer,
    onChange: (state) => {
      options.userActionOptions.onPrimaryStateChange(state);
      render();
    },
  });
  const selection = createStateManager({
    initialState: initialSelectionState,
    actions: timelineSelectionActions,
    reducer: timelineSelectionReducer,
    onChange: (state) => {
      options.userActionOptions.onSelectionStateChange(state);
      render();
    },
  });
  const view = createStateManager({
    initialState: initialViewState,
    actions: viewActions,
    reducer: viewReducer,
    onChange: (state) => {
      options.userActionOptions.onViewStateChange(state);
      render();
    },
  });
  const ephemeral = createStateManager({
    initialState: initialEphemeralState,
    actions: ephemeralActions,
    reducer: ephemeralReducer,
    onChange: (state) => {
      options.userActionOptions.onEphemeralStateChange?.(state);
      render();
    },
  });

  function render() {
    userActionOptions.render({
      primary: primary.state,
      selection: selection.state,
      view: view.state,
      ephemeral: ephemeral.state,
    });
  }

  const cancel = () => {
    for (const state of [primary, selection, view, ephemeral]) {
      state.reset();
    }
    userActionOptions.onCancel();
    onComplete();
  };

  if (typeof window !== "undefined") {
    // Likely running inside of Jest
    const escToken = addListener.keyboardOnce("Esc", "keydown", cancel);
    cancelTokens.push(escToken);
  }

  const params: RequestActionParams = {
    done,

    primary,
    selection,
    view,
    ephemeral,

    cancel,

    submit: (options) => {
      const { name, allowSelectionShift = false } = options;

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

      const prev: TrackedState = {
        primary: initialPrimaryState,
        selection: initialSelectionState,
        view: initialViewState,
      };
      const next: TrackedState = {
        primary: primary.state,
        selection: selection.state,
        view: view.state,
      };

      for (const shouldAddToStack of shouldAddToStackFns) {
        if (shouldAddToStack(prev, next)) {
          addToStack = true;
        }
      }

      if (!addToStack) {
        cancel();
        return;
      }

      ephemeral.reset();

      if (beforeSubmit) {
        beforeSubmit(params);
      }

      onComplete();
      userActionOptions.onSubmit({ name, allowSelectionShift });
    },

    addListener,

    removeListener: _removeListener,

    execOnComplete: (cb) => {
      onCompleteCallback = cb;
    },
  };

  callback(params);
};

export const requestAction = (
  options: RequestActionOptions,
  callback: RequestActionCallback
): void => {
  if (!getActionId()) {
    performRequestedAction(options, callback);
    return;
  }

  requestAnimationFrame(() => {
    if (!getActionId()) {
      performRequestedAction(options, callback);
      return;
    }
  });
};
