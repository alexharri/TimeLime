import {
  renderCircle,
  renderDiamond,
  renderRect,
  traceCubicBezier,
  traceLine,
} from "~/core/render/renderPrimitives";
import {
  createNormalToViewportXFn,
  createNormalToViewportYFn,
} from "~/core/utils/coords/normalToViewport";
import { getGraphEditorYBounds } from "~/core/render/yBounds";
import { keyframesToCurves } from "~/core/transform/keyframesToCurves";
import {
  roundRect,
  transformRectWithVecTransformation,
  translateRect,
} from "~/core/utils/math/math";
import { Vec2 } from "~/core/utils/math/Vec2";
import { generateGraphEditorYTicksFromBounds } from "~/core/utils/yTicks";
import { Curve, Rect, YBounds } from "~/types/commonTypes";
import { TimelineMap, TimelineSelectionMap } from "~/types/timelineTypes";
import { mapMap } from "map-fns";
import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { RenderState } from "~/core/state/stateTypes";
import { applyControlPointShift } from "~/core/timeline/applyControlPointShift";
import { theme } from "~/core/theme";
import { applyNewControlPointShift } from "~/core/timeline/applyNewControlPointShift";

interface RenderOptions {
  ctx: CanvasRenderingContext2D;
  timelines: TimelineMap;
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
  timelineSelectionState?: TimelineSelectionMap;

  yBounds?: YBounds;

  /** @default Vec2.ORIGIN */
  pan?: Vec2;

  dragSelectionRect?: Rect;
}

const getWidth = (options: RenderOptions): number => options.width ?? options.ctx.canvas.width;
const getHeight = (options: RenderOptions): number => options.height ?? options.ctx.canvas.height;
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
    pan = Vec2.ORIGIN,
    timelineSelectionState = {},
  } = options;
  const { width, height } = getDimensions(options);

  ctx.clearRect(0, 0, width, height);

  ctx.beginPath();
  ctx.rect(0, 0, width, height);
  ctx.fillStyle = theme.background;
  ctx.fill();

  const timelineList = Object.values(timelines);

  if (timelineList.length === 0) {
    // No work to be done.
    return;
  }

  const timelineCurves = timelineList.map((timeline) => keyframesToCurves(timeline.keyframes));

  /** @todo - take viewport as argument */
  const viewport: Rect = {
    width,
    height,
    left: 0,
    top: 0,
  };

  const toViewportY = createNormalToViewportYFn({
    viewport,
    length,
    timelines,
    viewBounds,
    yBounds,
    pan,
  });
  const toViewportX = createNormalToViewportXFn({
    length,
    viewBounds,
    viewport,
    pan,
  });
  const toViewport = (vec: Vec2) => Vec2.new(toViewportX(vec.x), toViewportY(vec.y));

  const atZero = Math.round(toViewportX(0));
  const atEnd = Math.round(toViewportX(length));

  if (atZero >= 0) {
    renderRect(
      ctx,
      { left: 0, width: atZero, top: 0, height },
      { fillColor: theme.backgroundOutside },
    );
    renderRect(
      ctx,
      { left: atZero - 1, top: 0, width: 1, height },
      { fillColor: theme.outsideBorder },
    );
    renderRect(
      ctx,
      { left: atZero, top: 0, width: 1, height },
      { fillColor: theme.insideHighlight },
    );
  }

  if (atEnd <= width) {
    renderRect(
      ctx,
      { left: atEnd, width: width - atEnd + 1, top: 0, height },
      { fillColor: theme.backgroundOutside },
    );
    renderRect(ctx, { left: atEnd, top: 0, width: 1, height }, { fillColor: theme.outsideBorder });
    renderRect(
      ctx,
      { left: atEnd - 1, top: 0, width: 1, height },
      { fillColor: theme.insideHighlight },
    );
  }

  const [yUpper, yLower] = yBounds || getGraphEditorYBounds({ viewBounds, length, timelines });

  const ticks = generateGraphEditorYTicksFromBounds([yUpper + pan.y, yLower + pan.y]);

  for (let i = 0; i < ticks.length; i += 1) {
    const y = Math.round(toViewportY(ticks[i]));
    const tickRect: Rect = { width, height: 1, left: 0, top: y };

    renderRect(ctx, tickRect, { fillColor: theme.yTickLineOutside });
    renderRect(ctx, translateRect(tickRect, Vec2.new(0, 1)), {
      fillColor: theme.yTickLineOutsideShadow,
    });
    ctx.font = "10px sans-serif";
    ctx.fillStyle = theme.yTickLabel;
    ctx.fillText(ticks[i].toString(), 8, y - 2);
  }

  for (let i = 0; i < ticks.length; i += 1) {
    const y = Math.round(toViewportY(ticks[i]));
    const tickRect: Rect = { width: atEnd - atZero, height: 1, left: atZero, top: y };

    renderRect(ctx, tickRect, { fillColor: theme.yTickLine });
    renderRect(ctx, translateRect(tickRect, Vec2.new(0, 1)), {
      fillColor: theme.yTickLineShadow,
    });
    ctx.font = "10px sans-serif";
    ctx.fillStyle = theme.yTickLabel;
    ctx.fillText(ticks[i].toString(), 8, y - 2);
  }

  timelineList.forEach((timeline, i) => {
    const { keyframes } = timeline;
    const curves = timelineCurves[i];

    const transformedCurves = curves.map((curve) => curve.map((vec) => toViewport(vec))) as Curve[];

    let color = theme.timelineColors[i % theme.timelineColors.length];

    if (options.colors?.[timeline.id]) {
      color = options.colors[timeline.id]!;
    }

    for (const [c, yOff] of <const>[
      [theme.timelineShadow, 1],
      [color, 0],
    ]) {
      ctx.beginPath();
      for (let i = 0; i < curves.length; i += 1) {
        let curve = transformedCurves[i];
        if (yOff !== 0) {
          curve = curve.map((v) => v.addY(yOff)) as typeof curve;
        }

        if (curve.length === 4) {
          traceCubicBezier(ctx, curve, { move: i === 0 });
        } else {
          traceLine(ctx, curve, { move: i === 0 });
        }
      }
      ctx.strokeStyle = c;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.closePath();
    }

    ctx.beginPath();
    {
      const { value: startValue, index: startIndex } = keyframes[0];
      const { value: endValue, index: endIndex } = keyframes[keyframes.length - 1];

      const startX = toViewportX(startIndex);
      const startY = Math.round(toViewportY(startValue)) - 0.5;

      const endX = toViewportX(endIndex);
      const endY = Math.round(toViewportY(endValue)) - 0.5;

      if (startX > 0) {
        traceLine(ctx, [Vec2.new(startX, startY), Vec2.new(0, startY)], { move: true });
      }

      if (endX < width) {
        traceLine(ctx, [Vec2.new(endX, endY), Vec2.new(width, endY)], { move: true });
      }
    }
    ctx.strokeStyle = color;
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
    ctx.strokeStyle = theme.controlPointColor;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

    /**
     * Keyframes
     */
    keyframes.forEach((k) => {
      // Flooring and adding (0.5, 0.5) makes the keyframe hit the middle of the pixel, which
      // makes it render in a crisp manner when the diamond width is an odd number.
      const vec = toViewport(Vec2.new(k.index, k.value)).floor().addXY(0.5, 0.5);
      const timelineSelection = timelineSelectionState[timeline.id];
      const selected = timelineSelection && timelineSelection.keyframes[k.id];

      if (selected) {
        renderDiamond(ctx, vec, { fillColor: theme.keyframeShadow, width: 18, height: 18 });
        renderDiamond(ctx, vec, { fillColor: theme.keyframeColor, width: 15, height: 15 });
        renderDiamond(ctx, vec, { fillColor: theme.keyframeFill, width: 11, height: 11 });
        renderDiamond(ctx, vec, { fillColor: theme.keyframeColor, width: 7, height: 7 });
      } else {
        renderDiamond(ctx, vec, { fillColor: theme.keyframeShadow, width: 14, height: 14 });
        renderDiamond(ctx, vec, { fillColor: theme.keyframeColor, width: 11, height: 11 });
        renderDiamond(ctx, vec, { fillColor: theme.keyframeFill, width: 7.5, height: 7.5 });
      }
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
        renderCircle(ctx, path[1], { color: theme.controlPointColor, radius: 2 });
      }

      if (k1.controlPointLeft) {
        renderCircle(ctx, path[2], { color: theme.controlPointColor, radius: 2 });
      }
    }
  });

  if (options.dragSelectionRect) {
    const rect = translateRect(
      roundRect(transformRectWithVecTransformation(options.dragSelectionRect, toViewport)),
      Vec2.new(0.5, 0.5),
    );
    renderRect(ctx, rect, {
      strokeColor: theme.selectionRectBorder,
      strokeWidth: 1,
      fillColor: theme.selectionRectFill,
    });
  }
}

export function renderGraphEditorWithRenderState(
  ctx: CanvasRenderingContext2D,
  renderState: RenderState,
) {
  const timelineSelectionState = renderState.selection;
  const { length, viewport, viewBounds } = renderState.view;
  const {
    keyframeShift,
    controlPointShift,
    yBounds,
    pan,
    dragSelectionRect,
    newControlPointShift,
  } = renderState.ephemeral;

  let { timelines } = renderState.primary;

  if (keyframeShift) {
    timelines = mapMap(timelines, (timeline) =>
      applyTimelineKeyframeShift({
        timeline,
        timelineSelection: renderState.selection[timeline.id],
        keyframeShift,
      }),
    );
  }

  if (controlPointShift) {
    timelines = mapMap(timelines, (timeline) =>
      applyControlPointShift({
        timeline,
        timelineSelection: renderState.selection[timeline.id],
        controlPointShift,
      }),
    );
  }

  if (newControlPointShift) {
    timelines = mapMap(timelines, (timeline) =>
      timeline.id === newControlPointShift.timelineId
        ? applyNewControlPointShift(timeline, newControlPointShift)
        : timeline,
    );
  }

  renderGraphEditor({
    ctx,
    length,
    timelines,
    width: viewport.width,
    height: viewport.height,
    timelineSelectionState,
    viewBounds,
    yBounds,
    pan,
    dragSelectionRect,
  });
}
