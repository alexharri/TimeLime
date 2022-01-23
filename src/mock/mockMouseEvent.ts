import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent } from "~/types/commonTypes";

interface Options {
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
}

export const mockMouseEvent = (
  position: Vec2,
  options: Partial<Options> = {}
): SomeMouseEvent => {
  const { altKey = false, shiftKey = false, metaKey = false } = options;

  return {
    clientX: position.x,
    clientY: position.y,
    altKey,
    metaKey,
    shiftKey,
  };
};
