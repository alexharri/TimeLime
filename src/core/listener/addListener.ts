import { isKeyCodeOf, isKeyDown, keys } from "~/core/listener/keyboard";
import { elementHasKeyboardFocus } from "~/core/utils/focus";

type Key = keyof typeof keys;

interface KeyboardTypeToEventMap {
  keydown: KeyboardEvent;
  keyup: KeyboardEvent;
  keypress: KeyboardEvent;
}

interface MouseTypeToEventMap {
  mousedown: MouseEvent;
  mouseup: MouseEvent;
  mousemove: MouseEvent;
}

type TypeToEventMap = KeyboardTypeToEventMap & MouseTypeToEventMap;

type KT2E = KeyboardTypeToEventMap;
type T2E = TypeToEventMap;

type Listener<T> = (e: T) => void;

let listenerMap: { [key: string]: any } = {};
let n = 0;

const createCancelToken = () => {
  n += 1;
  return n.toString();
};

interface Options {
  modifierKeys?: Key | Key[];
}

const _addListener = <T extends keyof TypeToEventMap, E = TypeToEventMap[T]>(
  cancelToken: string,
  type: T,
  listenerFn: Listener<E>,
  options?: Options
) => {
  const listener =
    options && options.modifierKeys
      ? (e: E) => {
          if (type === "keydown" || type === "keypress" || type === "keyup") {
            if (elementHasKeyboardFocus()) {
              return;
            }
          }

          const keys = Array.isArray(options.modifierKeys)
            ? options.modifierKeys
            : [options.modifierKeys!];
          for (let i = 0; i < keys.length; i += 1) {
            if (!isKeyDown(keys[i])) {
              return;
            }
          }
          listenerFn(e);
        }
      : (e: E) => {
          if (type === "keydown" || type === "keypress" || type === "keyup") {
            if (elementHasKeyboardFocus()) {
              return;
            }
          }
          listenerFn(e);
        };

  window.addEventListener(type, listener as any);
  listenerMap[cancelToken] = { type, listener };
};

const removeListenerExecuted = (cancelToken: string) => {
  if (!listenerMap[cancelToken]) {
    return;
  }

  const { type, listener } = listenerMap[cancelToken];
  window.removeEventListener(type, listener);

  listenerMap = Object.keys(listenerMap).reduce(
    (obj: typeof listenerMap, key) => {
      if (key !== cancelToken) {
        obj[key] = listenerMap[key];
      }
      return obj;
    },
    {}
  );
};

/**
 * @returns cancelToken
 */
function once<T extends keyof T2E, E = T2E[T]>(
  type: T,
  listenerFn: Listener<E>
): string;
function once<T extends keyof T2E, E = T2E[T]>(
  type: T,
  options: Options,
  listenerFn: Listener<E>
): string;
function once<T extends keyof T2E, E = T2E[T]>(
  type: T,
  optsOrListener: Options | Listener<E>,
  listenerFn?: Listener<E>
): string {
  const cancelToken = createCancelToken();
  const opts = typeof optsOrListener === "function" ? {} : optsOrListener;
  const listenerFunc =
    typeof optsOrListener === "function" ? optsOrListener : listenerFn!;

  const listener = (e: E) => {
    listenerFunc(e);
    removeListenerExecuted(cancelToken);
  };

  _addListener(cancelToken, type, listener, opts);
  return cancelToken;
}

/**
 * @returns cancelToken
 */
function repeated<T extends keyof T2E, E = T2E[T]>(
  type: T,
  listenerFn: Listener<E>
): string;
function repeated<T extends keyof T2E, E = T2E[T]>(
  type: T,
  options: Options,
  listenerFn: Listener<E>
): string;
function repeated<T extends keyof T2E, E = T2E[T]>(
  type: T,
  optsOrListener: Options | Listener<E>,
  listenerFn?: Listener<E>
): string {
  const cancelToken = createCancelToken();
  const opts = typeof optsOrListener === "function" ? {} : optsOrListener;
  const listener =
    typeof optsOrListener === "function" ? optsOrListener : listenerFn!;
  _addListener(cancelToken, type, listener, opts);
  return cancelToken;
}

/**
 * @returns cancelToken
 */
function keydownLong(key: Key, listenerFn: Listener<KeyboardEvent>): string;
function keydownLong(
  key: Key,
  options: Options,
  listenerFn: Listener<KeyboardEvent>
): string;
function keydownLong(
  key: Key,
  optsOrListener: Options | Listener<KeyboardEvent>,
  listenerFn?: Listener<KeyboardEvent>
): string {
  let isListenerKeyDown = false;

  const cancelToken = createCancelToken();
  const opts = typeof optsOrListener === "function" ? {} : optsOrListener;
  const listenerFunc =
    typeof optsOrListener === "function" ? optsOrListener : listenerFn!;

  const listener = (e: KeyboardEvent) => {
    if (!isKeyCodeOf(key, e.keyCode)) {
      return;
    }

    if (isListenerKeyDown) {
      return;
    }

    isListenerKeyDown = true;

    // This can be optimized
    keyboardOnce(key, "keyup", () => {
      isListenerKeyDown = false;
    });

    listenerFunc(e);
  };

  _addListener(cancelToken, "keydown", listener, opts);
  return cancelToken;
}

/**
 * @returns cancelToken
 */
function keyboardOnce<T extends keyof KT2E>(
  key: Key,
  type: T,
  listenerFn: Listener<KeyboardEvent>
): string;
function keyboardOnce<T extends keyof KT2E>(
  key: Key,
  type: T,
  options: Options,
  listenerFn: Listener<KeyboardEvent>
): string;
function keyboardOnce<T extends keyof KT2E>(
  key: Key,
  type: T,
  optsOrListener: Options | Listener<KeyboardEvent>,
  listenerFn?: Listener<KeyboardEvent>
): string {
  const cancelToken = createCancelToken();
  const opts = typeof optsOrListener === "function" ? {} : optsOrListener;
  const listenerFunc =
    typeof optsOrListener === "function" ? optsOrListener : listenerFn!;

  const listener = (e: KeyboardEvent) => {
    if (!isKeyCodeOf(key, e.keyCode)) {
      return;
    }

    listenerFunc(e);
    removeListenerExecuted(cancelToken);
  };

  _addListener(cancelToken, type, listener, opts);
  return cancelToken;
}

export const addListener = {
  once,
  repeated,
  keyboardOnce,
  keydownLong,
};

export const removeListener = removeListenerExecuted;
