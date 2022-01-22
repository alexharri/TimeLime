import { Vec2 } from "~/core/utils/math/Vec2";
import { CubicBezier, PartialCubicBezier } from "~/types/commonTypes";

const calcP2 = (p3: Vec2, p1: Vec2): Vec2 => {
  return Vec2.new(p1.x + (p3.x - p1.x) * 0.4, p1.y + (p3.y - p1.y) * 0.4);
};

export function partialToFullCubicBezier(
  bezier: PartialCubicBezier
): CubicBezier {
  const [p0, p1, p2, p3] = bezier;
  if (!p1) {
    const newP1 = calcP2(p2!, p0);
    return [p0, newP1, p2!, p3];
  } else {
    const newP2 = calcP2(p1!, p3);
    return [p0, p1, newP2, p3];
  }
}

export function splitCubicBezier(
  cubicBezier: CubicBezier,
  t: number
): [CubicBezier, CubicBezier] {
  const [p1, p2, p3, p4] = cubicBezier;

  const x1 = p1.x;
  const y1 = p1.y;

  const x2 = p2.x;
  const y2 = p2.y;

  const x3 = p3.x;
  const y3 = p3.y;

  const x4 = p4.x;
  const y4 = p4.y;

  const x12 = (x2 - x1) * t + x1;
  const y12 = (y2 - y1) * t + y1;

  const x23 = (x3 - x2) * t + x2;
  const y23 = (y3 - y2) * t + y2;

  const x34 = (x4 - x3) * t + x3;
  const y34 = (y4 - y3) * t + y3;

  const x123 = (x23 - x12) * t + x12;
  const y123 = (y23 - y12) * t + y12;

  const x234 = (x34 - x23) * t + x23;
  const y234 = (y34 - y23) * t + y23;

  const x1234 = (x234 - x123) * t + x123;
  const y1234 = (y234 - y123) * t + y123;

  // Credit to https://stackoverflow.com/a/8405756.
  return [
    [
      Vec2.new(x1, y1),
      Vec2.new(x12, y12),
      Vec2.new(x123, y123),
      Vec2.new(x1234, y1234),
    ],
    [
      Vec2.new(x1234, y1234),
      Vec2.new(x234, y234),
      Vec2.new(x34, y34),
      Vec2.new(x4, y4),
    ],
  ];
}

export function bezierVecAtT(bezier: CubicBezier, t: number): Vec2 {
  const out = [...bezier];

  for (let degree = bezier.length - 2; degree >= 0; degree--) {
    for (let i = 0; i <= degree; i++) {
      out[i] = out[i].lerp(out[i + 1], t);
    }
  }

  return out[0];
}
