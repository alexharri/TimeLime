import { MOUSE_MOVE_TRESHOLD } from "~/core/constants";
import { isKeyDown, Key } from "~/core/listener/keyboard";
import {
  requestAction,
  RequestActionCallback,
  RequestActionParams,
  ShouldAddToStackFn,
} from "~/core/state/requestAction";
import { ActionOptions } from "~/core/state/stateTypes";
import { getDistance } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { MousePosition, Rect, SomeMouseEvent } from "~/types/commonTypes";

interface MouseMoveOptions<KeyMap> {
  initialMousePosition: MousePosition;
  mousePosition: MousePosition;
  moveVector: MousePosition;
  keyDown: KeyMap;
  firstMove: boolean;
}

interface MouseMoveActionEndFn {
  (params: RequestActionParams, options: { hasMoved: boolean }): void;
}

interface MouseDownMoveActionOptions<K extends Key> {
  userActionOptions: ActionOptions;
  e?: SomeMouseEvent;
  initialMousePosition?: Vec2;
  params?: RequestActionParams;
  keys?: K[];
  beforeMove?: (
    params: RequestActionParams,
    options: { mousePosition: MousePosition }
  ) => void;
  mouseMove: (
    params: RequestActionParams,
    options: MouseMoveOptions<Record<K, boolean>>
  ) => void;
  mouseUp?: MouseMoveActionEndFn;
  mouseDown?: MouseMoveActionEndFn;
  globalToNormal?: (vec: Vec2) => Vec2;
  globalToNormalX?: (value: number) => number;
  globalToNormalY?: (value: number) => number;
  moveTreshold?: number;
  shouldAddToStack?: ShouldAddToStackFn | ShouldAddToStackFn[];
  tickShouldUpdate?: (
    params: RequestActionParams,
    options: MouseMoveOptions<Record<K, boolean>>
  ) => boolean;
  viewport?: Rect;
}

export const mouseDownMoveAction = <K extends Key>(
  options: MouseDownMoveActionOptions<K>
): void => {
  const { keys = [] } = options;

  let translate: (vec: Vec2) => Vec2;

  if (options.globalToNormal) {
    translate = options.globalToNormal;
  } else if (options.globalToNormalX || options.globalToNormalY) {
    translate = (vec) => {
      const x = options.globalToNormalX
        ? options.globalToNormalX(vec.x)
        : vec.x;
      const y = options.globalToNormalY
        ? options.globalToNormalY(vec.y)
        : vec.y;
      return Vec2.new(x, y);
    };
  } else {
    translate = (vec) => vec;
  }

  let initialGlobalMousePosition: Vec2;

  if (options.e) {
    initialGlobalMousePosition = Vec2.fromEvent(options.e);
  } else if (options.initialMousePosition) {
    initialGlobalMousePosition = options.initialMousePosition;
  } else {
    throw new Error(
      "Either 'e' or 'initialMousePosition' must be provided to 'mouseDownMoveAction'."
    );
  }

  const initialMousePosition: MousePosition = {
    global: initialGlobalMousePosition,
    viewport: options.viewport
      ? initialGlobalMousePosition.sub(
          Vec2.new(options.viewport.left, options.viewport.top)
        )
      : initialGlobalMousePosition,
    normal: translate(initialGlobalMousePosition),
  };

  const fn: RequestActionCallback = (params) => {
    options.beforeMove?.(params, { mousePosition: initialMousePosition });

    if (params.done) {
      // If user submitted/cancelled in `beforeMove`
      return;
    }

    let hasMoved = false;
    let hasCalledMove = false;
    let lastKeyDownMap: Record<K, boolean> = {} as Record<K, boolean>;

    let currentMousePosition = initialGlobalMousePosition;
    let lastUsedMousePosition = initialGlobalMousePosition;

    const tick = () => {
      if (params.done) {
        return;
      }

      requestAnimationFrame(tick);

      if (!hasMoved) {
        return;
      }

      let shouldUpdate = false;

      const keyDownMap = (lastKeyDownMap = keys.reduce<Record<K, boolean>>(
        (acc, key) => {
          const keyDown = isKeyDown(key);

          if (lastKeyDownMap[key] !== keyDown) {
            shouldUpdate = true;
          }

          acc[key] = keyDown;
          return acc;
        },
        {} as Record<K, boolean>
      ));

      let _options!: MouseMoveOptions<Record<K, boolean>>;
      const getOptions = () => {
        if (_options) {
          return _options;
        }

        const globalMousePosition = currentMousePosition;
        const mousePosition: MousePosition = {
          global: globalMousePosition,
          viewport: options.viewport
            ? globalMousePosition.sub(
                Vec2.new(options.viewport.left, options.viewport.top)
              )
            : globalMousePosition,
          normal: translate(globalMousePosition),
        };
        const moveVector: MousePosition = {
          global: mousePosition.global.sub(initialMousePosition.global),
          viewport: mousePosition.viewport.sub(initialMousePosition.viewport),
          normal: mousePosition.normal.sub(initialMousePosition.normal),
        };
        _options = {
          initialMousePosition,
          mousePosition,
          moveVector,
          keyDown: keyDownMap,
          firstMove: !hasCalledMove,
        };
        return _options;
      };

      if (!shouldUpdate && options.tickShouldUpdate?.(params, getOptions())) {
        shouldUpdate = true;
      }

      if (!shouldUpdate && lastUsedMousePosition === currentMousePosition) {
        return;
      }

      lastUsedMousePosition = currentMousePosition;

      const callOpts = getOptions();
      hasCalledMove = true;
      options.mouseMove(params, callOpts);
    };
    requestAnimationFrame(tick);

    params.addListener.repeated("mousemove", (e) => {
      currentMousePosition = Vec2.fromEvent(e);

      if (!hasMoved) {
        if (
          getDistance(currentMousePosition, initialMousePosition.global) <=
          (options.moveTreshold ?? MOUSE_MOVE_TRESHOLD)
        ) {
          return;
        }
        hasMoved = true;
      }
    });

    if (options.mouseUp) {
      setTimeout(() => {
        params.addListener.once("mouseup", () => {
          options.mouseUp!(params, { hasMoved });
        });
      });
    }

    if (options.mouseDown) {
      setTimeout(() => {
        params.addListener.once("mousedown", () => {
          options.mouseDown!(params, { hasMoved });
        });
      });
    }
  };

  if (options.params) {
    fn(options.params);
    return;
  }

  const { userActionOptions } = options;
  requestAction(
    { userActionOptions, shouldAddToStack: options.shouldAddToStack },
    fn
  );
};
