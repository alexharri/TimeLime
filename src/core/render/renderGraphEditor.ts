import { colors } from "~/core/colors";
import { TIMELINE_CANVAS_END_START_BUFFER } from "~/core/constants";
import {
  renderCircle,
  renderDiamond,
  renderLine,
  renderRect,
  traceCubicBezier,
  traceLine,
} from "~/core/render/renderPrimitives";
import {
  createGraphEditorNormalToViewportX,
  createGraphEditorNormalViewportY,
} from "~/core/render/viewport";
import { getGraphEditorYBoundsFromPaths } from "~/core/render/yBounds";
import { convertTimelineKeyframesToCurves } from "~/core/transform/timelineKeyframesToCurves";
import { transformRectWithVecTransformation } from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { generateGraphEditorYTicksFromBounds } from "~/core/utils/yTicks";
import { Curve, Line, Rect, YBounds } from "~/types/commonTypes";
import { Timeline, TimelineSelectionMap } from "~/types/timelineTypes";

interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  timelines: Timeline[];
  length: number;

  /** @default canvas.width */
  width?: number;

  /** @default canvas.height */
  height?: number;

  /**
   * `start` and `end` should be numbers from 0 to 1. `start` should always be lower than `end`.
   *
   * @default [0, 1]
   */
  viewBounds?: [start: number, end: number];

  /**
   * If not provided, colors will be based on the order of the timelines.
   */
  colors?: Partial<{ [timelineId: string]: string }>;

  /** @default {} */
  timelineSelectionMap?: TimelineSelectionMap;

  yBounds?: YBounds;

  /** @default 0 */
  yPan?: number;

  dragSelectRect?: Rect;
}

const getWidth = (options: RenderOptions): number =>
  options.width ?? options.ctx.canvas.width;
const getHeight = (options: RenderOptions): number =>
  options.height ?? options.ctx.canvas.height;
const getDimensions = (options: RenderOptions) => ({
  width: getWidth(options),
  height: getHeight(options),
});

export function renderGraphEditor(options: RenderOptions) {
  const {
    ctx,
    timelines,
    viewBounds = [0, 1],
    length,
    yBounds,
    yPan = 0,
    timelineSelectionMap = {},
  } = options;
  const { width, height } = getDimensions(options);

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.fillStyle = colors.gray600;
  ctx.fill();

  if (timelines.length === 0) {
    // No work to be done.
    return;
  }

  const timelineCurves = timelines.map((timeline) =>
    convertTimelineKeyframesToCurves(timeline.keyframes)
  );

  const toViewportY = createGraphEditorNormalViewportY(timelineCurves, {
    height,
    length,
    timelines,
    viewBounds,
    yBounds,
    yPan: undefined,
  });
  const toViewportX = createGraphEditorNormalToViewportX({
    length,
    viewBounds,
    width,
  });
  const toViewport = (vec: Vec2) =>
    Vec2.new(toViewportX(vec.x), toViewportY(vec.y));

  const atZero = toViewportX(0);
  const atEnd = toViewportX(length);

  if (atZero > 0) {
    renderRect(
      ctx,
      {
        left: atZero - TIMELINE_CANVAS_END_START_BUFFER - 1,
        width: TIMELINE_CANVAS_END_START_BUFFER,
        top: 0,
        height,
      },
      { fillColor: colors.dark500 }
    );
  }

  if (atEnd < width) {
    renderRect(
      ctx,
      {
        left: atEnd,
        width: width - atEnd + 1,
        top: 0,
        height,
      },
      { fillColor: colors.dark500 }
    );
  }

  const [yUpper, yLower] =
    yBounds ||
    getGraphEditorYBoundsFromPaths({
      viewBounds,
      length,
      timelines,
      timelineCurves,
    });

  const ticks = generateGraphEditorYTicksFromBounds([
    yUpper + yPan,
    yLower + yPan,
  ]);

  for (let i = 0; i < ticks.length; i += 1) {
    const y = toViewportY(ticks[i]);
    const line: Line = [Vec2.new(0, y), Vec2.new(width, y)];
    renderLine(ctx, line, {
      color: colors.dark500,
      strokeWidth: 1,
    });
    ctx.font = "10px sans-serif";
    ctx.fillStyle = colors.light500;
    ctx.fillText(ticks[i].toString(), 8, y - 2);
  }

  timelines.forEach((timeline, i) => {
    const { keyframes } = timeline;
    const curves = timelineCurves[i];

    const transformedCurves = curves.map((curve) =>
      curve.map((vec) => toViewport(vec))
    ) as Curve[];

    let color = "red";

    if (options.colors?.[timeline.id]) {
      color = options.colors[timeline.id]!;
    }

    ctx.beginPath();
    for (let i = 0; i < curves.length; i += 1) {
      const curve = transformedCurves[i];
      if (curve.length === 4) {
        traceCubicBezier(ctx, curve, { move: i === 0 });
      } else {
        traceLine(ctx, curve, { move: i === 0 });
      }
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    {
      const { value: startValue, index: startIndex } = keyframes[0];
      const { value: endValue, index: endIndex } =
        keyframes[keyframes.length - 1];

      const startX = toViewportX(startIndex);
      const startY = toViewportY(startValue);

      const endX = toViewportX(endIndex);
      const endY = toViewportY(endValue);

      if (startX > 0) {
        traceLine(ctx, [Vec2.new(startX, startY), Vec2.new(0, startY)], {
          move: true,
        });
      }

      if (endX < width) {
        traceLine(ctx, [Vec2.new(endX, endY), Vec2.new(width, endY)], {
          move: true,
        });
      }
    }
    ctx.setLineDash([8, 8]);
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);

    /**
     * Control point lines
     */
    ctx.beginPath();
    for (let i = 0; i < keyframes.length - 1; i += 1) {
      const path = transformedCurves[i];

      if (path.length === 2) {
        continue;
      }

      const k0 = keyframes[i];
      const k1 = keyframes[i + 1];

      if (k0.controlPointRight) {
        traceLine(ctx, [path[0], path[1]], { move: true });
      }

      if (k1.controlPointLeft) {
        traceLine(ctx, [path[2], path[3]], { move: true });
      }
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = "yellow";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    /**
     * Keyframes
     */
    keyframes.forEach((k) => {
      const vec = toViewport(Vec2.new(k.index, k.value));
      const timelineSelection = timelineSelectionMap[timeline.id];
      const selected = timelineSelection && timelineSelection.keyframes[k.id];
      renderDiamond(ctx, vec, {
        fillColor: selected ? "#2f9eff" : "#333",
        width: 7.5,
        height: 7.5,
        strokeColor: "#2f9eff",
        strokeWidth: 1,
      });
    });

    /**
     * Control point dots
     */
    for (let i = 0; i < keyframes.length - 1; i += 1) {
      const path = transformedCurves[i];

      if (path.length === 2) {
        continue;
      }

      const k0 = keyframes[i];
      const k1 = keyframes[i + 1];

      if (k0.controlPointRight) {
        renderCircle(ctx, path[1], { color: "yellow", radius: 2 });
      }

      if (k1.controlPointLeft) {
        renderCircle(ctx, path[2], { color: "yellow", radius: 2 });
      }
    }

    if (options.dragSelectRect) {
      const rect = transformRectWithVecTransformation(
        options.dragSelectRect,
        toViewport
      );
      renderRect(ctx, rect, {
        strokeColor: colors.red500,
        strokeWidth: 1,
        fillColor: "rgba(255, 0, 0, .1)",
      });
    }
  });
}
