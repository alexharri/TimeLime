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
import { timelineSelectionActions } from "~/core/state/timelineSelection/timelineSelectionActions";
import { timelineSelectionReducer } from "~/core/state/timelineSelection/timelineSelectionReducer";
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

type StateStore<T, A extends ActionCollection> = {
  state: T;
  dispatch: (callback: (actions: A) => ActionsReturnType<A>) => void;
  reset: () => void;
};

export interface RequestActionParams {
  primary: StateStore<PrimaryState, typeof timelineActions>;
  selection: StateStore<SelectionState, typeof timelineSelectionActions>;
  view: StateStore<ViewState, typeof viewActions>;
  ephemeral: StateStore<EphemeralState, typeof ephemeralActions>;

  cancel: () => void;
  submit: (options: SubmitOptions) => void;
  addListener: typeof _addListener;
  removeListener: typeof _removeListener;
  done: boolean;
  execOnComplete: (callback: () => void) => void;
}

export interface RequestActionCallback {
  (params: RequestActionParams): void;
}

interface RequestActionOptions {
  userActionOptions: ActionOptions;
  shouldAddToStack?: ShouldAddToStackFn | ShouldAddToStackFn[];
}

let _n = 0;
let _actionId: string | null;

const getActionId = () => _actionId;

const performRequestedAction = (
  options: RequestActionOptions,
  callback: RequestActionCallback
) => {
  const { shouldAddToStack, userActionOptions } = options;

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

  interface CreateStateStoreOptions<T, A extends ActionCollection> {
    initialState: T;
    reducer: (state: T, action: ActionsReturnType<A>) => T;
    actions: A;
    onChange: (state: T) => void;
  }

  const createStateStore = <T, A extends ActionCollection>(
    options: CreateStateStoreOptions<T, A>
  ): StateStore<T, A> => {
    const obj: StateStore<T, A> = {
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

  const initialPrimaryState = options.userActionOptions.initialState.primary;
  const initialSelectionState =
    options.userActionOptions.initialState.selection;
  const initialViewState = options.userActionOptions.initialState.view;
  const initialEphemeralState = {};

  const primary = createStateStore({
    initialState: initialPrimaryState,
    actions: timelineActions,
    reducer: timelineReducer,
    onChange: (state) => {
      options.userActionOptions.onStateChange?.primary?.(state);
      render();
    },
  });
  const selection = createStateStore({
    initialState: initialSelectionState,
    actions: timelineSelectionActions,
    reducer: timelineSelectionReducer,
    onChange: (state) => {
      options.userActionOptions.onStateChange?.selection?.(state);
      render();
    },
  });
  const view = createStateStore({
    initialState: initialViewState,
    actions: viewActions,
    reducer: viewReducer,
    onChange: (state) => {
      options.userActionOptions.onStateChange?.view?.(state);
      render();
    },
  });
  const ephemeral = createStateStore({
    initialState: initialEphemeralState,
    actions: ephemeralActions,
    reducer: ephemeralReducer,
    onChange: (state) => {
      options.userActionOptions.onStateChange?.ephemeral?.(state);
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
    get done() {
      return done();
    },

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

      const prevState: TrackedState = {
        primary: initialPrimaryState,
        selection: initialSelectionState,
        view: initialViewState,
      };
      const nextState: TrackedState = {
        primary: primary.state,
        selection: selection.state,
        view: view.state,
      };

      for (const shouldAddToStack of shouldAddToStackFns) {
        if (shouldAddToStack(prevState, nextState)) {
          addToStack = true;
        }
      }

      if (!addToStack) {
        cancel();
        return;
      }

      ephemeral.reset();

      onComplete();
      userActionOptions.onSubmit({
        name,
        allowSelectionShift,
        state: nextState,
      });
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
