import { renderLine } from "~/core/render/renderPrimitives";
import { theme } from "~/core/theme";
import { createNormalToViewportXFn } from "~/core/utils/coords/normalToViewport";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getGraphEditorViewport, getScrubberViewport } from "~/core/utils/viewportUtils";
import { Line } from "~/types/commonTypes";
import { RenderOptions } from "~/types/renderTypes";

const { floor } = Math;

const MIN_DIST_BETWEEN_TICKS = 46;
const FRAME_INCREMENTS = [1, 2, 5, 10, 15, 30];

export const renderTimelineScrubber = (options: RenderOptions): void => {
  const { ctx, length, viewBounds, viewBoundsHeight, viewport, scrubberHeight, pan } = options;

  const scrubberViewport = getScrubberViewport({ viewport, scrubberHeight, viewBoundsHeight });
  const graphEditorViewport = getGraphEditorViewport({
    viewport,
    scrubberHeight,
    viewBoundsHeight,
  });
  const { width, height, left, top } = scrubberViewport;

  const normalToViewportX = createNormalToViewportXFn({
    graphEditorViewport,
    viewBounds,
    length,
    pan,
  });

  const iStart = Math.round(length * viewBounds[0]);
  const iEnd = Math.round(length * viewBounds[1]);

  const renderSeconds = normalToViewportX(60) - normalToViewportX(0) < MIN_DIST_BETWEEN_TICKS * 2;
  let framesBetweenTicks = 60;

  if (renderSeconds) {
    while (normalToViewportX(framesBetweenTicks) - normalToViewportX(0) < MIN_DIST_BETWEEN_TICKS) {
      framesBetweenTicks *= 2;
    }
  } else {
    let i = 0;

    const atZero = normalToViewportX(0);
    while (
      normalToViewportX(FRAME_INCREMENTS[i]) - atZero < MIN_DIST_BETWEEN_TICKS &&
      i < FRAME_INCREMENTS.length
    ) {
      i++;
    }
    framesBetweenTicks = FRAME_INCREMENTS[i];
  }

  const textY = top + 12;
  const lineY0 = top + 14;
  const lineY1 = height + top;

  ctx.beginPath();
  ctx.rect(left, top, width, height);
  ctx.fillStyle = theme.scrubberBackground;
  ctx.fill();

  ctx.font = `10px sans-serif`;
  ctx.fillStyle = theme.scrubberTickTextColor;

  // Render ticks
  for (let i = floor(iStart / framesBetweenTicks - 1); i <= iEnd / framesBetweenTicks + 1; i++) {
    let text: string;

    if (renderSeconds) {
      text = `${Number((i * (framesBetweenTicks / 60)).toFixed(2))}s`;
    } else {
      const frameCount = (i * framesBetweenTicks) % 60;
      text = frameCount === 0 ? `${i}:00f` : `${frameCount}f`;
    }

    const x = normalToViewportX(i * framesBetweenTicks);

    const textWidth = ctx.measureText(text).width;
    ctx.fillText(text, x - textWidth / 2, textY);

    const tickLine: Line = [Vec2.new(x, lineY0), Vec2.new(x, lineY1)];
    renderLine(ctx, tickLine, { color: theme.scrubberTickLine, strokeWidth: 1 });
  }

  ctx.beginPath();
  ctx.rect(left, top + height - 1, width, 1);
  ctx.fillStyle = theme.scrubberBorderBottom;
  ctx.fill();
};
