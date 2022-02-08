import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, ViewBounds, YBounds } from "~/types/commonTypes";
import { TimelineMap, TimelineSelectionMap } from "~/types/timelineTypes";

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  timelines: TimelineMap;
  length: number;
  viewport: Rect;
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
  scrubberHeight: number;

  /**
   * If not provided, colors will be based on the order of the timelines.
   */
  colors?: Partial<{ [timelineId: string]: string }>;

  /** @default {} */
  timelineSelectionState?: TimelineSelectionMap;

  yBounds?: YBounds;

  /** @default Vec2.new(0, 0) */
  pan?: Vec2;

  dragSelectionRect?: Rect;
}
