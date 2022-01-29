import { StateManager } from "~/core/state/StateManager";

interface State {
  value: number;
}
interface SelectionState {
  value: string;
}

export const actions = {
  setValue: (value: number) => ({ type: "set-value", value }),
  setSelection: (value: string) => ({ type: "set-selection", value }),
};

function reducer(state: State, action: any): State {
  switch (action.type) {
    case "set-value":
      return { ...state, value: action.value };
    default:
      return state;
  }
}

function selectionReducer(state: SelectionState, action: any): SelectionState {
  switch (action.type) {
    case "set-selection":
      return { ...state, value: action.value };
    default:
      return state;
  }
}

const stateKey = "state";
const selectionStateKey = "selection";

const stateManagerFactory = () =>
  new StateManager({
    initialState: { value: 1 },
    initialSelectionState: { value: "a" },

    stateKey,
    selectionStateKey,

    reducer,
    selectionReducer,
  });

describe("StateManager", () => {
  it("initializes correctly", () => {
    const state = stateManagerFactory();

    expect(state.getCurrentState()).toEqual({
      state: { value: 1 },
      selection: { value: "a" },
    });
    expect(state.getCurrentState()).toEqual(state.getActionState());
  });

  it("starts an action", () => {
    const state = stateManagerFactory();

    const fn = jest.fn();

    state.requestAction((params) => {
      fn();
      params.cancelAction();
    });

    expect(fn.mock.calls.length).toEqual(1);
  });

  it("returns the action state correctly", () => {
    const state = stateManagerFactory();

    const fn = jest.fn();

    state.requestAction((params) => {
      fn();

      params.dispatch(actions.setValue(2));
      params.dispatch(actions.setSelection("b"));

      const currState = state.getCurrentState();
      const actionState = state.getActionState();

      expect(currState.state.value).toEqual(1);
      expect(actionState.state.value).toEqual(2);
      expect(currState.selection.value).toEqual("a");
      expect(actionState.selection.value).toEqual("b");

      params.cancelAction();
    });

    const currState = state.getCurrentState();
    const actionState = state.getActionState();

    expect(currState.state.value).toEqual(1);
    expect(currState.selection.value).toEqual("a");
    expect(actionState.state.value).toEqual(1);
    expect(actionState.selection.value).toEqual("a");

    expect(fn.mock.calls.length).toEqual(1); // Ensure that the test ran
  });

  it("modifies the state after submitting an action", () => {
    const state = stateManagerFactory();

    state.requestAction((params) => {
      params.dispatch(actions.setValue(2));
      params.dispatch(actions.setSelection("b"));

      expect(state.getCurrentState().state.value).toEqual(1);
      expect(state.getActionState().state.value).toEqual(2);

      params.submitAction({ name: "Action" });
    });

    expect(state.getCurrentState()).toEqual({
      state: { value: 2 },
      selection: { value: "b" },
    });
  });

  it("supports undo/redo", () => {
    const state = stateManagerFactory();

    state.requestAction((params) => {
      params.dispatch(actions.setValue(2));
      params.dispatch(actions.setSelection("b"));
      params.submitAction({ name: "Action" });
    });

    expect(state.getCurrentState().state.value).toEqual(2);

    state.requestAction((params) => {
      params.dispatch(actions.setValue(3));
      params.dispatch(actions.setSelection("c"));
      params.submitAction({ name: "Action" });
    });

    expect(state.getCurrentState()).toEqual({
      state: { value: 3 },
      selection: { value: "c" },
    });
    state.undo();
    expect(state.getCurrentState()).toEqual({
      state: { value: 2 },
      selection: { value: "b" },
    });
    state.undo();
    expect(state.getCurrentState()).toEqual({
      state: { value: 1 },
      selection: { value: "a" },
    });
    state.redo();
    expect(state.getCurrentState()).toEqual({
      state: { value: 2 },
      selection: { value: "b" },
    });
    state.redo();
    expect(state.getCurrentState()).toEqual({
      state: { value: 3 },
      selection: { value: "c" },
    });
  });

  it("allows the user to undo, modify the selection, then redo", () => {
    const state = stateManagerFactory();

    expect(state.getCurrentState()).toEqual({
      state: { value: 1 },
      selection: { value: "a" },
    });

    state.requestAction((params) => {
      params.dispatch(actions.setValue(2));
      params.submitAction({ name: "Action" });
    });

    expect(state.getCurrentState()).toEqual({
      state: { value: 2 },
      selection: { value: "a" },
    });

    state.undo();

    expect(state.getCurrentState()).toEqual({
      state: { value: 1 },
      selection: { value: "a" },
    });

    state.requestAction((params) => {
      params.dispatch(actions.setSelection("b"));
      params.submitAction({ name: "Action" });
    });

    state.requestAction((params) => {
      params.dispatch(actions.setSelection("c"));
      params.submitAction({ name: "Action" });
    });

    state.redo();

    expect(state.getCurrentState()).toEqual({
      state: { value: 2 },
      selection: { value: "a" },
    });
  });
});
