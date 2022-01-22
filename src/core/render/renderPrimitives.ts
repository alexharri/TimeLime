import { Vec2 } from "~/core/utils/math/Vec2";
import { CubicBezier, Line, Rect } from "~/types/commonTypes";

interface TraceCurveOptions {
  move?: boolean;
}

interface RenderRectOptions {
  fillColor: string;
  strokeWidth?: number;
  strokeColor?: string;
}

export function traceRect(ctx: CanvasRenderingContext2D, rect: Rect) {
  ctx.rect(rect.left, rect.top, rect.width, rect.height);
}

export function renderRect(
  ctx: CanvasRenderingContext2D,
  rects: Rect | Rect[],
  opts: RenderRectOptions
): void {
  const recArr = Array.isArray(rects) ? rects : [rects];

  const { fillColor, strokeWidth = 0, strokeColor } = opts;

  ctx.fillStyle = fillColor;
  for (let i = 0; i < recArr.length; i += 1) {
    ctx.beginPath();
    traceRect(ctx, recArr[i]);
    ctx.fill();

    if (strokeWidth > 0 && strokeColor) {
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }

    ctx.closePath();
  }
}

interface RenderLineOptions {
  color: string;
  strokeWidth: number;
  lineDash?: number[];
}

export function traceLine(
  ctx: CanvasRenderingContext2D,
  line: Line,
  traceOptions: TraceCurveOptions = {}
): void {
  const [a, b] = line;
  if (traceOptions.move) {
    ctx.moveTo(a.x, a.y);
  }
  ctx.lineTo(b.x, b.y);
}

export function renderLine(
  ctx: CanvasRenderingContext2D,
  line: Line,
  opts: RenderLineOptions
): void {
  const { color, strokeWidth } = opts;

  ctx.beginPath();
  traceLine(ctx, line, { move: true });
  ctx.strokeStyle = color;
  ctx.lineWidth = strokeWidth;
  if (opts.lineDash) {
    ctx.setLineDash(opts.lineDash);
  }
  ctx.stroke();

  // Reset
  ctx.setLineDash([]);
}

export function traceCubicBezier(
  ctx: CanvasRenderingContext2D,
  bezier: CubicBezier,
  traceOptions: TraceCurveOptions = {}
): void {
  const [p0, p1, p2, p3] = bezier;
  if (traceOptions.move) {
    ctx.moveTo(p0.x, p0.y);
  }
  ctx.bezierCurveTo(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
}

interface RenderDiamondOptions {
  fillColor: string;
  width: number;
  height: number;
  strokeWidth?: number;
  strokeColor?: string;
}

export function renderDiamond(
  ctx: CanvasRenderingContext2D,
  atPoint: Vec2 | Vec2[],
  opts: RenderDiamondOptions
): void {
  const vecs = Array.isArray(atPoint) ? atPoint : [atPoint];

  const { fillColor, width, height, strokeWidth = 0, strokeColor } = opts;

  ctx.fillStyle = fillColor;

  for (let i = 0; i < vecs.length; i += 1) {
    const path = () => {
      const { x, y } = vecs[i];
      ctx.beginPath();
      ctx.moveTo(x, y + height / 2); // Top
      ctx.lineTo(x + width / 2, y); // Right
      ctx.lineTo(x, y - height / 2); // Bottom
      ctx.lineTo(x - width / 2, y); // Left
      ctx.lineTo(x, y + height / 2); // Back to top
    };

    path();
    ctx.fill();

    if (strokeWidth > 0 && strokeColor) {
      path();
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  }
}

interface RenderCircleOptions {
  color: string;
  radius: number;
  strokeWidth?: number;
  strokeColor?: string;
}

export function traceCircle(
  ctx: CanvasRenderingContext2D,
  position: Vec2,
  radius: number
): void {
  ctx.arc(position.x, position.y, radius, 0, 2 * Math.PI, false);
}

export function renderCircle(
  ctx: CanvasRenderingContext2D,
  vectors: Vec2 | Vec2[],
  opts: RenderCircleOptions
): void {
  const vecs = Array.isArray(vectors) ? vectors : [vectors];

  const { color, radius, strokeWidth = 0, strokeColor } = opts;

  ctx.fillStyle = color;

  for (let i = 0; i < vecs.length; i += 1) {
    const { x, y } = vecs[i];
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.closePath();
    ctx.fill();

    if (strokeWidth > 0 && strokeColor) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
      ctx.lineWidth = strokeWidth;
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  }
}
