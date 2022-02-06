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

function traceLeftRoundedRect(ctx: CanvasRenderingContext2D, rect: Rect, borderRadius: number) {
  ctx.beginPath();
  ctx.moveTo(rect.left + rect.width, rect.top);
  ctx.lineTo(rect.left + borderRadius, rect.top);
  ctx.arc(
    rect.left + borderRadius,
    rect.top + borderRadius,
    borderRadius,
    -Math.PI * 0.5,
    Math.PI,
    true,
  );
  ctx.lineTo(rect.left, rect.top + borderRadius);
  ctx.arc(
    rect.left + borderRadius,
    rect.top + rect.height - borderRadius,
    borderRadius,
    Math.PI,
    Math.PI * 0.5,
    true,
  );
  ctx.lineTo(rect.left + rect.width, rect.top + rect.height);
  ctx.closePath();
}

function traceRightRoundedRect(ctx: CanvasRenderingContext2D, rect: Rect, borderRadius: number) {
  ctx.beginPath();
  ctx.moveTo(rect.left, rect.top);
  ctx.lineTo(rect.left + rect.width - borderRadius, rect.top);
  ctx.arc(
    rect.left + rect.width - borderRadius,
    rect.top + borderRadius,
    borderRadius,
    -Math.PI * 0.5,
    0,
    false,
  );
  ctx.lineTo(rect.left + rect.width, rect.top + borderRadius);
  ctx.arc(
    rect.left + rect.width - borderRadius,
    rect.top + rect.height - borderRadius,
    borderRadius,
    0,
    Math.PI * 0.5,
    false,
  );
  ctx.lineTo(rect.left, rect.top + rect.height);
  ctx.closePath();
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

  traceLeftRoundedRect(
    ctx,
    contractRect({ width: VIEW_BOUNDS_HANDLE_WIDTH, height: 24, top: 0, left: firstLeft }, 0.5),
    4,
  );
  ctx.fillStyle = colors.light200;
  ctx.fill();
  ctx.strokeStyle = colors.dark200;
  ctx.lineWidth = 1;
  ctx.stroke();

  traceRightRoundedRect(
    ctx,
    contractRect({ width: VIEW_BOUNDS_HANDLE_WIDTH, height: 24, top: 0, left: secondLeft }, 0.5),
    4,
  );

  ctx.fillStyle = colors.light200;
  ctx.fill();
  ctx.strokeStyle = colors.dark200;
  ctx.lineWidth = 1;
  ctx.stroke();

  renderRect(
    ctx,
    {
      left: firstLeft + VIEW_BOUNDS_HANDLE_WIDTH,
      top: 1,
      height: 22,
      width: secondLeft - firstLeft - VIEW_BOUNDS_HANDLE_WIDTH,
    },
    { fillColor: colors.gray300 },
  );
  renderRect(
    ctx,
    {
      left: firstLeft + VIEW_BOUNDS_HANDLE_WIDTH,
      top: 1,
      height: 1,
      width: secondLeft - firstLeft - VIEW_BOUNDS_HANDLE_WIDTH,
    },
    { fillColor: colors.gray600 },
  );
}
