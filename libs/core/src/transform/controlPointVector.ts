import { TimelineKeyframe } from "timelime/types";
import { lerp } from "~core/utils/math/math";
import { Vec2 } from "~core/utils/math/Vec2";

export const controlPointAsVector = (
  whichControlPoint: "cp0" | "cp1",
  k0: TimelineKeyframe,
  k1: TimelineKeyframe,
): Vec2 | null => {
  const k = whichControlPoint === "cp0" ? k0 : k1;
  const cp = whichControlPoint === "cp0" ? k.controlPointRight : k.controlPointLeft;

  if (!cp) {
    return null;
  }

  const t = (k1.index - k0.index) / cp.relativeToDistance;
  return Vec2.new(lerp(k0.index, k1.index, cp.tx), k.value + cp.value * t);
};
