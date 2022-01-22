import { DEG_TO_RAD_FAC } from "~/core/constants";
import { parseCurves } from "~/core/parse/parseCurves";
import { getAngleRadians } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { ICurve } from "~/types/commonTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

export function curvesToKeyframes(inputCurves: ICurve[]): TimelineKeyframe[] {
  const curves = parseCurves(inputCurves);

  const keyframes: TimelineKeyframe[] = [];

  for (let i = 0; i < curves.length + 1; i++) {
    const id = i.toString();

    const prevCurve = curves[i - 1];
    const curve = curves[i];
    if (!curve) {
      // Last keyframe
      keyframes.push({
        id,
        controlPointLeft: null,
        controlPointRight: null,
        index: prevCurve[prevCurve.length - 1].x,
        value: prevCurve[prevCurve.length - 1].y,
        reflectControlPoints: false,
      });
      continue;
    }

    keyframes.push({
      id,
      index: curve[0].x,
      value: curve[0].y,
      controlPointLeft: null,
      controlPointRight: null,
      reflectControlPoints: false,
    });
  }

  // Set control points
  for (let i = 0; i < curves.length; i++) {
    const curve = curves[i];

    if (curve.length === 2) {
      // No control points
      continue;
    }

    const k0 = keyframes[i];
    const k1 = keyframes[i + 1];

    const relativeToDistance = k1.index - k0.index;

    const cp0_value = curve[1].y - k0.value;
    const cp1_value = curve[2].y - k1.value;

    const cp0_tx = (curve[1].x - k0.index) / relativeToDistance;
    const cp1_tx = (curve[2].x - k0.index) / relativeToDistance;

    k0.controlPointRight = {
      relativeToDistance,
      tx: cp0_tx,
      value: cp0_value,
    };
    k1.controlPointLeft = {
      relativeToDistance,
      tx: cp1_tx,
      value: cp1_value,
    };
  }

  // Find which control points should be reflected
  for (const k of keyframes) {
    const cpl = k.controlPointLeft;
    const cpr = k.controlPointRight;

    if (!cpl || !cpr) {
      continue;
    }

    const p = Vec2.new(k.index, k.value);
    const pl = p.addXY(cpl.relativeToDistance * (1 - cpl.tx), cpl.value);
    const pr = p.addXY(cpr.relativeToDistance * cpr.tx, cpr.value);

    const l_angle = getAngleRadians(p, pl);
    const r_angle = getAngleRadians(p, pr);

    const difference = Math.abs(l_angle - -r_angle);

    if (difference < DEG_TO_RAD_FAC * 0.5) {
      // If the difference in angle is less than half a degree we consider the keyframes
      // to be reflected.
      k.reflectControlPoints = true;
    }
  }

  return keyframes;
}
