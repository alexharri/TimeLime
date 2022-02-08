import { renderLine } from "~/core/render/renderPrimitives";
import { theme } from "~/core/theme";
import { createNormalToViewportXFn } from "~/core/utils/coords/normalToViewport";
import { Vec2 } from "~/core/utils/math/Vec2";
import { getGraphEditorViewport, getScrubberViewport } from "~/core/utils/viewportUtils";
import { RenderOptions } from "~/types/renderTypes";

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

  const MIN_DIST = 46;

  let useSec = false;

  // For frames
  const potentialNBetween = [1, 2, 5, 10, 15, 30];
  let betweenIndex = 0;

  while (
    normalToViewportX(potentialNBetween[betweenIndex]) - normalToViewportX(0) < MIN_DIST &&
    betweenIndex < potentialNBetween.length
  ) {
    betweenIndex++;
  }

  const nBetween = potentialNBetween[betweenIndex];

  let fac = 60;

  while (normalToViewportX(fac) - normalToViewportX(0) < MIN_DIST) {
    fac *= 2;
  }

  useSec = normalToViewportX(fac) - normalToViewportX(0) < MIN_DIST * 2;

  let tickBy!: number;

  tickBy = fac;

  ctx.beginPath();
  ctx.rect(left, top, width, height);
  ctx.fillStyle = theme.scrubberBackground;
  ctx.fill();

  const start = Math.floor(length * viewBounds[0]);
  const end = Math.ceil(length * viewBounds[1]);

  ctx.font = `10px sans-serif`;
  ctx.fillStyle = theme.scrubberTickTextColor;

  const textY = top + 12;
  const lineY0 = top + 14;
  const lineY1 = height + top;

  if (useSec) {
    for (let i = start - (start % tickBy); i <= end; i += tickBy) {
      const x = normalToViewportX(i);

      const t = `${Number((i / 60).toFixed(2))}s`;
      const w = ctx.measureText(t).width;
      ctx.fillText(t, x - w / 2, textY);

      renderLine(ctx, [Vec2.new(x, lineY0), Vec2.new(x, lineY1)], {
        color: theme.scrubberTickLine,
        strokeWidth: 1,
      });
    }
    return;
  }

  const fStart = start - (start % nBetween);
  for (let i = fStart; i <= end; i += nBetween) {
    const x = Math.floor(normalToViewportX(i)) + 0.5;
    const d = i % 60;

    const t = d === 0 ? `${i / 60}:00f` : `${d}f`;
    const w = ctx.measureText(t).width;
    ctx.fillText(t, x - w / 2, textY);

    renderLine(ctx, [Vec2.new(x, lineY0), Vec2.new(x, lineY1)], {
      color: theme.scrubberTickLine,
      strokeWidth: 1,
    });
  }

  ctx.beginPath();
  ctx.rect(left, top + height - 1, width, 1);
  ctx.fillStyle = theme.scrubberBorderBottom;
  ctx.fill();
};
