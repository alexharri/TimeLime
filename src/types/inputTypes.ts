import { Vec2 } from "~/core/utils/math/Vec2";

export type InputLine = [InputVec2, InputVec2];
export type InputCubicBezier = [InputVec2, InputVec2, InputVec2, InputVec2];
export type InputCurve = InputLine | InputCubicBezier;
export type InputVec2 =
  | Vec2
  | [number, number]
  | { x: number; y: number }
  | { left: number; top: number };
