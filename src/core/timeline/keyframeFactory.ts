import { TimelineKeyframe, TimelineKeyframeControlPoint } from "~/types/timelineTypes";

interface Options {
  id: string;
  index: number;
  value: number;
  controlPointLeft?: TimelineKeyframeControlPoint | null;
  controlPointRight?: TimelineKeyframeControlPoint | null;
  reflectControlPoints?: boolean;
}

export function keyframeFactory(options: Options): TimelineKeyframe {
  const {
    id,
    index,
    value,
    controlPointLeft = null,
    controlPointRight = null,
    reflectControlPoints = false,
  } = options;
  return { id, index, value, controlPointLeft, controlPointRight, reflectControlPoints };
}
