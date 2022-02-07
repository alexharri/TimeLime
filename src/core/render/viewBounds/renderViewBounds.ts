import { colors } from "~/core/colors";
import { VIEW_BOUNDS_HANDLE_WIDTH } from "~/core/constants";
import { renderRect } from "~/core/render/renderPrimitives";
import { theme } from "~/core/theme";
import { contractRect } from "~/core/utils/math/math";
import { shiftViewBoundsByX } from "~/core/utils/viewUtils";
import { Rect } from "~/types/commonTypes";
import { RenderOptions } from "~/types/renderTypes";

// For reference:
//
//    Top left:      ctx.arc(x, y, radius, -Math.PI * 0.5,  Math.PI,       true);
//    Bottom left:   ctx.arc(x, y, radius,  Math.PI,        Math.PI * 0.5, true);
//    Top right:     ctx.arc(x, y, radius, -Math.PI * 0.5,  0,             false);
//    Bottom right:  ctx.arc(x, y, radius, 0,               Math.PI * 0.5, false);
//

const { PI } = Math;
const br = 4; // Border radius

const getCoords = (rect: Rect) => {
  const x0 = rect.left;
  const x1 = rect.left + rect.width;
  const y0 = rect.top;
  const y1 = rect.top + rect.height;
  return [x0, x1, y0, y1];
};

function traceLeftRoundedRect(ctx: CanvasRenderingContext2D, rect: Rect, full: boolean) {
  const [x0, x1, y0, y1] = getCoords(rect);
  ctx.beginPath();
  ctx.moveTo(x1, y0);
  ctx.lineTo(x0 + br, y0);
  ctx.arc(x0 + br, y0 + br, br, -PI * 0.5, PI, true);
  ctx.lineTo(x0, y0 + br);
  if (full) {
    ctx.arc(x0 + br, y1 - br, br, PI, PI * 0.5, true);
    ctx.lineTo(x1, y1);
    ctx.closePath();
  } else {
    // We're drawing the "highlight" of the rounded rect
    ctx.arc(x0 + br, y1 - br, br, PI, PI * 0.75, true);
  }
}

function traceRightRoundedRect(ctx: CanvasRenderingContext2D, rect: Rect, full: boolean) {
  const [x0, x1, y0, y1] = getCoords(rect);
  ctx.moveTo(x0, y1);
  ctx.lineTo(x0, y0);
  ctx.lineTo(x1 - br, y0);
  if (full) {
    ctx.arc(x1 - br, y0 + br, br, -PI * 0.5, 0, false);
    ctx.lineTo(x1, y0 + br);
    ctx.arc(x1 - br, y1 - br, br, 0, PI * 0.5, false);
    ctx.closePath();
  } else {
    // We're drawing the "highlight" of the rounded rect
    ctx.arc(x1 - br, y0 + br, br, -PI * 0.5, -PI * 0.2, false);
  }
}

export function renderViewBounds(options: RenderOptions) {
  const { ctx, viewBoundsHeight, viewport, pan, length } = options;

  const viewBounds = pan
    ? shiftViewBoundsByX(
        { allowExceedViewBounds: true, length, viewBounds: options.viewBounds },
        pan.x,
      )
    : options.viewBounds;

  ctx.clearRect(0, 0, viewport.width, viewBoundsHeight);

  renderRect(
    ctx,
    { top: 0, left: 0, width: viewport.width, height: viewBoundsHeight },
    { fillColor: theme.viewBoundsBackground },
  );
  renderRect(
    ctx,
    { top: 0, left: 0, width: viewport.width, height: 1 },
    { fillColor: colors.dark200 },
  );
  renderRect(
    ctx,
    { top: viewBoundsHeight - 1, left: 0, width: viewport.width, height: 1 },
    { fillColor: colors.dark200 },
  );

  const w = viewport.width - VIEW_BOUNDS_HANDLE_WIDTH * 2;

  const firstLeft = Math.floor(viewBounds[0] * w);
  const secondLeft = Math.ceil(VIEW_BOUNDS_HANDLE_WIDTH + viewBounds[1] * w);

  const width = VIEW_BOUNDS_HANDLE_WIDTH;
  const rectLeft: Rect = { width, height: viewBoundsHeight, top: 0, left: firstLeft };
  const rectRight: Rect = { width, height: viewBoundsHeight, top: 0, left: secondLeft };

  ctx.beginPath();
  traceLeftRoundedRect(ctx, contractRect(rectLeft, 0.5), true);
  traceRightRoundedRect(ctx, contractRect(rectRight, 0.5), true);
  ctx.fillStyle = colors.light200;
  ctx.strokeStyle = colors.dark200;
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  traceLeftRoundedRect(ctx, contractRect(rectLeft, 1.5), false);
  traceRightRoundedRect(ctx, contractRect(rectRight, 1.5), false);
  ctx.strokeStyle = colors.light400;
  ctx.lineWidth = 1;
  ctx.stroke();

  {
    const left = firstLeft + VIEW_BOUNDS_HANDLE_WIDTH;
    const width = secondLeft - firstLeft - VIEW_BOUNDS_HANDLE_WIDTH;
    const top = 1;
    renderRect(
      ctx,
      { left, top, width, height: viewBoundsHeight - 2 },
      { fillColor: colors.gray300 },
    );
    renderRect(ctx, { left, top, width, height: 1 }, { fillColor: colors.gray600 });
  }
}
