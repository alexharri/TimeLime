import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect } from "~/types/commonTypes";

/**
 * Linear interpolation (lerp) between two numbers.
 */
export const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t;

export function getAngleRadians(from: Vec2, to: Vec2): number {
  const vec = to.sub(from);
  const angle = Math.atan2(vec.y, vec.x);
  return angle;
}

/**
 * @param vec - Vec2 to rotate
 * @param rad - Angle to rotate CCW in radians
 * @param anchor - `vec` is rotated around the anchor
 */
export function rotateVec2CCW(vec: Vec2, rad: number, anchor = Vec2.ORIGIN): Vec2 {
  if (rad === 0) {
    return vec;
  }

  const sin = Math.sin(rad);
  const cos = Math.cos(rad);

  let x = vec.x - anchor.x;
  let y = vec.y - anchor.y;

  x = x * cos + y * -sin;
  y = x * sin + y * cos;

  x += anchor.x;
  y += anchor.y;

  return Vec2.new(x, y);
}

export function getDistance(a: Vec2, b: Vec2) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

export const lerpInCanvasRange = (
  value: number,
  rangeMin: number,
  rangeMax: number,
  canvasWidth: number,
) => {
  const diff = rangeMax - rangeMin;
  const cutoff = rangeMax - diff;

  return lerp(0, canvasWidth, (value - cutoff) / diff);
};

export const transformRectWithVecTransformation = (
  rect: Rect,
  transformFn: (vec: Vec2) => Vec2,
): Rect => {
  const { x: left, y: top } = transformFn(Vec2.new(rect.left, rect.top));
  const v0 = transformFn(Vec2.new(0, 0));
  const v1 = transformFn(Vec2.new(1, 1));
  let { x: wt, y: ht } = v1.sub(v0);
  const width = rect.width * wt;
  const height = rect.height * ht;
  return { left, top, width, height };
};

export const capToRange = (low: number, high: number, value: number) =>
  Math.min(high, Math.max(low, value));

export const translateRect = (rect: Rect, vec: Vec2) => {
  const { width, height, top, left } = rect;
  return { top: top + vec.y, left: left + vec.x, width, height };
};

export const roundRect = (rect: Rect) => {
  const { width, height, top, left } = rect;
  return {
    top: Math.round(top),
    left: Math.round(left),
    width: Math.round(width),
    height: Math.round(height),
  };
};

/**
 * @returns the bounding rect around two vectors `a` and `b`.
 */
export const rectOfTwoVecs = (a: Vec2, b: Vec2): Rect => {
  const xMin = Math.min(a.x, b.x);
  const xMax = Math.max(a.x, b.x);
  const yMin = Math.min(a.y, b.y);
  const yMax = Math.max(a.y, b.y);
  return {
    height: yMax - yMin,
    width: xMax - xMin,
    left: xMin,
    top: yMin,
  };
};

export const isVecInRect = (vec: Vec2, rect: Rect) =>
  vec.x >= rect.left &&
  vec.x <= rect.left + rect.width &&
  vec.y >= rect.top &&
  vec.y <= rect.top + rect.height;
