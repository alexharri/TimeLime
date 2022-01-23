import { MouseEvent } from "react";
import { Vec2 } from "~/core/utils/math/Vec2";

export interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export type CubicBezier = [Vec2, Vec2, Vec2, Vec2];

/**
 * It is expected in the partial bezier [p0, p1, p2, p3] either p1 or p2 will be null,
 * but noth both. Allowing both to be null in the type avoids a lot of verbose typing.
 */
export type PartialCubicBezier = [Vec2, Vec2 | null, Vec2 | null, Vec2];
export type Line = [Vec2, Vec2];
export type Curve = CubicBezier | Line;

export type ViewBounds = [number, number];
export type YBounds = [number, number];

export interface MousePosition {
  global: Vec2;
  viewport: Vec2;
  normal: Vec2;
}

export type SomeMouseEvent = Pick<
  MouseEvent,
  "altKey" | "clientX" | "clientY" | "shiftKey" | "metaKey"
>;
