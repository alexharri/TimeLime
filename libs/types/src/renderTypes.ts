import { Vec2 } from "timelime/core";
import { Rect, ViewBounds, YBounds } from "~types/commonTypes";
import { TimelineMap, TimelineSelectionState } from "~types/timelineTypes";

export interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  timelines: TimelineMap;
  timelineSelectionState: TimelineSelectionState;
  length: number;
  viewport: Rect;
  viewBounds: ViewBounds;
  viewBoundsHeight: number;
  scrubberHeight: number;
  frameIndex: number;

  /**
   * If not provided, colors will be based on the order of the timelines.
   */
  colors?: Partial<{ [timelineId: string]: string }>;

  yBounds?: YBounds;

  /** @default Vec2.new(0, 0) */
  pan?: Vec2;

  dragSelectionRect?: Rect;
}
