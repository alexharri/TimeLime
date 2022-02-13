import { Curve, InputCurve } from "timelime/types";
import { Vec2 } from "~core/utils/math/Vec2";

export const parseCurves = (inputCurves: InputCurve[]): Curve[] => {
  return inputCurves.map((curve) => curve.map(Vec2.new)) as Curve[];
};
