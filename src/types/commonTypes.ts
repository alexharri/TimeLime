import { MouseEvent } from "react";
import { Vec2 } from "~/core/utils/math/Vec2";
import { TimelineKeyframe } from "~/types/timelineTypes";

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
export type YBounds = [yUpper: number, yLower: number];

export interface MousePosition {
  global: Vec2;
  viewport: Vec2;
  normal: Vec2;
}

export type SomeMouseEvent = Pick<
  MouseEvent,
  "altKey" | "clientX" | "clientY" | "shiftKey" | "metaKey"
>;

export type Action = { type: string };

export interface ActionCollection {
  [key: string]: (...args: any[]) => { type: string };
}

type ValuesInObject<T> = T[keyof T];

export type ActionsReturnType<A extends ActionCollection> = ValuesInObject<
  { [K in keyof A]: ReturnType<A[K]> }
>;

export type ActionToPerform =
  | {
      type: "alt_mousedown_keyframe";
      timelineId: string;
      keyframe: TimelineKeyframe;
    }
  | {
      type: "mousedown_keyframe";
      timelineId: string;
      keyframe: TimelineKeyframe;
    }
  | {
      type: "mousedown_control_point";
      timelineId: string;
      keyframe: TimelineKeyframe;
      which: "left" | "right";
    }
  | {
      type: "mousedown_empty";
    }
  | {
      type: "pan";
    }
  | {
      type: "zoom_out";
    }
  | {
      type: "zoom_in";
    }
  | {
      type: "scrub";
    }
  | {
      type: "pan_view_bounds";
    }
  | {
      type: "mousedown_view_bounds_handle";
      which: "left" | "right";
    };
