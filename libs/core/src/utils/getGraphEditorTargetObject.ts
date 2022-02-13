import { Timeline, TimelineKeyframe } from "timelime/types";
import { CONTROL_POINT_DISTANCE_TRESHOLD, KEYFRAME_DISTANCE_TRESHOLD } from "~core/constants";
import { controlPointAsVector } from "~core/transform/controlPointVector";
import { getDistance } from "~core/utils/math/math";
import { Vec2 } from "~core/utils/math/Vec2";

type GraphEditorTargetObject =
  | {
      type: "keyframe";
      keyframe: TimelineKeyframe;
    }
  | {
      type: "control_point";
      keyframe: TimelineKeyframe;
      which: "left" | "right";
    }
  | {
      type: "none";
    };

export const getGraphEditorTargetObject = (
  timeline: Timeline,
  viewportMousePosition: Vec2,
  normalToViewport: (vec: Vec2) => Vec2,
): GraphEditorTargetObject => {
  const { keyframes } = timeline;

  // Check whether a control point was clicked
  for (let i = 0; i < keyframes.length - 1; i += 1) {
    const k0 = keyframes[i];
    const k1 = keyframes[i + 1];

    const cp0 = controlPointAsVector("cp0", k0, k1);
    const cp1 = controlPointAsVector("cp1", k0, k1);

    const cp0_dist = cp0 ? getDistance(normalToViewport(cp0), viewportMousePosition) : Infinity;
    const cp1_dist = cp1 ? getDistance(normalToViewport(cp1), viewportMousePosition) : Infinity;

    if (cp0_dist < CONTROL_POINT_DISTANCE_TRESHOLD) {
      return {
        type: "control_point",
        keyframe: keyframes[i],
        which: "right",
      };
    }

    if (cp1_dist < CONTROL_POINT_DISTANCE_TRESHOLD) {
      return {
        type: "control_point",
        keyframe: keyframes[i + 1],
        which: "left",
      };
    }
  }

  // Check whether a keyframe was clicked
  for (let i = 0; i < keyframes.length; i += 1) {
    const keyframe = keyframes[i];

    const keyframePos = Vec2.new(keyframe.index, keyframe.value);
    const keyframeViewportPosition = normalToViewport(keyframePos);

    const dist = getDistance(keyframeViewportPosition, viewportMousePosition);

    if (dist < KEYFRAME_DISTANCE_TRESHOLD) {
      return { type: "keyframe", keyframe: keyframes[i] };
    }
  }

  return { type: "none" };
};
