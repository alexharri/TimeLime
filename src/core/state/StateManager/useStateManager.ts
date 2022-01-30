import { useEffect, useMemo, useState } from "react";
import { isKeyCodeOf } from "~/core/listener/keyboard";
import {
  StateManager,
  StateManagerOptions,
} from "~/core/state/StateManager/StateManager";
import { Action } from "~/types/commonTypes";

interface Options {
  history?: boolean;
}

export function useStateManager<
  T,
  S,
  AT extends Action,
  AS extends Action,
  TK extends string,
  SK extends string
>(
  options: Omit<
    StateManagerOptions<T, S, AT, AS, TK, SK>,
    "onStateChangeCallback"
  > &
    Options
) {
  const [n, setN] = useState(0);

  const stateManager = useMemo(() => {
    return new StateManager({
      ...options,

      onStateChangeCallback: () => setN((n) => n + 1),
    });
  }, []);

  const state = useMemo(() => stateManager.getActionState(), [n]);

  const { history = true } = options;

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (!history) {
        return;
      }

      if (isKeyCodeOf("Z", e.keyCode) && e.metaKey && e.shiftKey) {
        stateManager.redo();
        return;
      }
      if (isKeyCodeOf("Z", e.keyCode) && e.metaKey) {
        stateManager.undo();
        return;
      }
    };

    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [history]);

  return { state, stateManager };
}
