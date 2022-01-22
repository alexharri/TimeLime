import { Vec2 } from "~/core/utils/math/Vec2";
import { SomeMouseEvent } from "~/types/commonTypes";

interface Options {
  altKey: boolean;
}

export const mockMouseEvent = (
  position: Vec2,
  options: Partial<Options> = {}
): SomeMouseEvent => {
  const { altKey = false } = options;

  return {
    clientX: position.x,
    clientY: position.y,
    altKey,
  };
};
