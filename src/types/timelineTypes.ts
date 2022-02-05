import { Vec2 } from "~/core/utils/math/Vec2";

export type TimelineMap = {
  [timelineId: string]: Timeline;
};

export interface Timeline {
  id: string;
  keyframes: TimelineKeyframe[];
}

export interface TimelineKeyframeControlPoint {
  tx: number; // 0 - 1
  value: number; // Value relative to keyframe value
  relativeToDistance: number; // The distance at which the value is defined
}

export interface TimelineKeyframe {
  id: string;
  index: number;
  value: number;
  reflectControlPoints: boolean;
  controlPointLeft: TimelineKeyframeControlPoint | null;
  controlPointRight: TimelineKeyframeControlPoint | null;
}

export interface TimelineSelection {
  keyframes: Partial<Record<string, boolean>>;
}

export type TimelineSelectionMap = Partial<{
  [timelineId: string]: TimelineSelection;
}>;

export interface ControlPointShift {
  shiftVector: Vec2;
  distanceBetweenKeyframes: number;
  direction: "left" | "right";
  yFac: number;
  shiftDown: boolean;
}
