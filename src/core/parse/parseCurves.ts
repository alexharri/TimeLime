import { Vec2 } from "~/core/utils/math/Vec2";
import { Curve, ICurve } from "~/types/commonTypes";

export const parseCurves = (inputCurves: ICurve[]): Curve[] => {
  return inputCurves.map((curve) => curve.map(Vec2.new)) as Curve[];
};
