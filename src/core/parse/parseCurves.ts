import { Vec2 } from "~/core/utils/math/Vec2";
import { Curve } from "~/types/commonTypes";
import { InputCurve } from "~/types/inputTypes";

export const parseCurves = (inputCurves: InputCurve[]): Curve[] => {
  return inputCurves.map((curve) => curve.map(Vec2.new)) as Curve[];
};
