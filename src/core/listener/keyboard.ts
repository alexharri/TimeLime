import { elementHasKeyboardFocus } from "~/core/utils/focus";

export const keys = {
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Shift: 16,
  Control: 17,
  Alt: 18,
  Esc: 27,
  Space: 32,
  Delete: 46,
  A: 65,
  B: 66,
  C: 67,
  F: 70,
  G: 71,
  I: 73,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  U: 85,
  V: 86,
  X: 88,
  Z: 90,
  Command: 91,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
};

export type Key = keyof typeof keys;

const keyCodes = (Object.keys(keys) as Array<keyof typeof keys>).reduce<{
  [keyCode: number]: keyof typeof keys;
}>((obj, key) => {
  obj[keys[key]] = key;
  return obj;
}, {});

let keyPressMap: { [key: string]: boolean } = {};

export const getKeyFromKeyCode = (keyCode: number): Key | null => {
  return keyCodes[keyCode];
};

export const isKeyDown = (key: Key): boolean => {
  return !!keyPressMap[keys[key]];
};

const _listeners: { [key: string]: Array<(isKeyDown: boolean) => void> } = {};

if (typeof window !== "undefined") {
  window.addEventListener("keydown", (e: KeyboardEvent) => {
    if (elementHasKeyboardFocus()) {
      return;
    }

    keyPressMap[e.keyCode] = true;
    const key = getKeyFromKeyCode(e.keyCode);
    _listeners[key!] && _listeners[key!].forEach((fn) => fn(true));
  });
  window.addEventListener("keyup", (e: KeyboardEvent) => {
    if (elementHasKeyboardFocus()) {
      return;
    }

    const key = keyCodes[e.keyCode];
    if (key === "Command" || key === "Alt" || key === "Control") {
      keyPressMap = {};
      Object.keys(_listeners).forEach((listenerKey) => {
        _listeners[listenerKey].forEach((fn) => fn(false));
      });
    } else {
      keyPressMap[e.keyCode] = false;
      Object.keys(_listeners).forEach((listenerKey) => {
        _listeners[listenerKey].forEach((fn) => fn(false));
      });
    }
  });
}

export const isKeyCodeOf = (key: Key, keyCode: number): boolean => keys[key] === keyCode;

export const addKeyDownChangeListener = (
  key: Key,
  options: { allowRepeated: boolean },
  fn: (isKeyDown: boolean) => void,
): void => {
  let _down = false;
  const listener = (isKeyDown: boolean) => {
    if (isKeyDown && _down && !options.allowRepeated) {
      return;
    }

    _down = isKeyDown;
    fn(isKeyDown);
  };
  (listener as any)._fn = fn;

  if (!_listeners[key]) {
    _listeners[key] = [];
  }
  _listeners[key].push(listener);
};

export const removeKeyDownChangeListener = (key: Key, fn: (isKeyDown: boolean) => void): void => {
  if (!_listeners[key]) {
    return;
  }
  _listeners[key] = _listeners[key].filter((_fn) => {
    if (typeof (_fn as any)._fn === "function") {
      return (_fn as any)._fn !== fn;
    }

    return _fn !== fn;
  });
};

export const _MockKey = {
  down: (key: Key) => {
    keyPressMap[keys[key]] = true;
  },
  up: (key: Key) => {
    keyPressMap[keys[key]] = false;
  },
};
