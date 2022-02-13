import { Vec2 } from "timelime/core";

export type InputVec2 =
  | Vec2
  | [number, number]
  | { x: number; y: number }
  | { left: number; top: number };

export type InputLine = [InputVec2, InputVec2];
export type InputCubicBezier = [InputVec2, InputVec2, InputVec2, InputVec2];
export type InputCurve = InputLine | InputCubicBezier;
