interface InputKeyframeControlPoint {
  /** Number between 0-1 */
  tx: number;
  /** `value` is relative to the keyframe's value */
  value: number;
}

interface InputKeyframe {
  /** The 0-indexed frame of the keyframe */
  frame: number;
  /** The value (Y position) of the keyframe */
  value: number;
  controlPointLeft?: InputKeyframeControlPoint;
  controlPointRight?: InputKeyframeControlPoint;
}

interface InputTimeline {
  keyframes: InputKeyframe[];
  /** Length of timeline in frames. */
  length: number;
}
