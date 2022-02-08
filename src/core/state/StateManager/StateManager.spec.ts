import { StateManager } from "~/core/state/StateManager/StateManager";

const stateManagerFactory = () =>
  new StateManager({
    initialState: { value: 1 },
    initialSelectionState: { value: "a" },
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

      params.setState({ value: 2 });
      params.setSelection({ value: "b" });

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
      params.setState({ value: 2 });
      params.setSelection({ value: "b" });

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
      params.setState({ value: 2 });
      params.setSelection({ value: "b" });
      params.submitAction({ name: "Action" });
    });

    expect(state.getCurrentState().state.value).toEqual(2);

    state.requestAction((params) => {
      params.setState({ value: 3 });
      params.setSelection({ value: "c" });
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
      params.setState({ value: 2 });
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
      params.setSelection({ value: "b" });
      params.submitAction({ name: "Action" });
    });

    state.requestAction((params) => {
      params.setSelection({ value: "c" });
      params.submitAction({ name: "Action" });
    });

    state.redo();

    expect(state.getCurrentState()).toEqual({
      state: { value: 2 },
      selection: { value: "a" },
    });
  });
});
