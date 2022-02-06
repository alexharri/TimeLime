import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, YBounds } from "~/types/commonTypes";
import { TimelineMap, TimelineSelectionMap } from "~/types/timelineTypes";

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  timelines: TimelineMap;
  length: number;

  /** @default canvas.width */
  width?: number;

  /** @default canvas.height */
  height?: number;

  /**
   * `start` and `end` should be numbers from 0 to 1. `start` should always be lower than `end`.
   */
  viewBounds: [start: number, end: number];

  viewBoundsHeight: number;

  /**
   * If not provided, colors will be based on the order of the timelines.
   */
  colors?: Partial<{ [timelineId: string]: string }>;

  /** @default {} */
  timelineSelectionState?: TimelineSelectionMap;

  yBounds?: YBounds;

  /** @default Vec2.ORIGIN */
  pan?: Vec2;

  dragSelectionRect?: Rect;
}
