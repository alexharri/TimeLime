import { TimelineSelectionState } from "~/core/state/timelineSelection/timelineSelectionReducer";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, ViewBounds, YBounds } from "~/types/commonTypes";
import { TimelineMap } from "~/types/timelineTypes";

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
