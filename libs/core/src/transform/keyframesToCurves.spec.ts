import { Curve, TimelineKeyframe } from "timelime/types";
import { keyframesToCurves } from "~core/transform/keyframesToCurves";
import { Vec2 } from "~core/utils/math/Vec2";

const keyframeBase = {
  controlPointLeft: null,
  controlPointRight: null,
  reflectControlPoints: false,
};

describe("keyframesToCurves", () => {
  it("converts a line correctly", () => {
    const keyframes: TimelineKeyframe[] = [
      {
        ...keyframeBase,
        id: "0",
        index: 0,
        value: 50,
      },
      {
        ...keyframeBase,
        id: "1",
        index: 25,
        value: 100,
      },
    ];
    const curves: Curve[] = [[Vec2.new(0, 50), Vec2.new(25, 100)]];
    expect(JSON.stringify(keyframesToCurves(keyframes))).toEqual(JSON.stringify(curves));
  });

  it("converts a cubic bezier correctly", () => {
    const keyframes: TimelineKeyframe[] = [
      {
        ...keyframeBase,
        id: "0",
        index: 0,
        value: 50,
        controlPointRight: {
          tx: 0.25,
          value: 10,
          relativeToDistance: 25,
        },
      },
      {
        ...keyframeBase,
        id: "1",
        index: 25,
        value: 100,
        controlPointLeft: {
          tx: 0.75,
          value: 10,
          relativeToDistance: 25,
        },
      },
    ];
    const curves: Curve[] = [
      [Vec2.new(0, 50), Vec2.new(25 * 0.25, 60), Vec2.new(25 * 0.75, 110), Vec2.new(25, 100)],
    ];
    expect(JSON.stringify(keyframesToCurves(keyframes))).toEqual(JSON.stringify(curves));
  });

  it("correctly applies relativeToDistance", () => {
    const keyframes: TimelineKeyframe[] = [
      {
        ...keyframeBase,
        id: "0",
        index: 0,
        value: 50,
        controlPointRight: {
          tx: 0.25,
          value: 10,
          // Notice how this value does not match the real distance between the keyframes
          relativeToDistance: 4,
        },
      },
      {
        ...keyframeBase,
        id: "1",
        index: 25,
        value: 100,
        controlPointLeft: {
          tx: 0.75,
          value: 10,
          relativeToDistance: 25,
        },
      },
    ];
    const curves: Curve[] = [
      [
        Vec2.new(0, 50),
        Vec2.new(25 * 0.25, 50 + 10 * (25 / 4)), // The value of the cp is multipled by (distance / relativeToDistance)
        Vec2.new(25 * 0.75, 110),
        Vec2.new(25, 100),
      ],
    ];
    expect(JSON.stringify(keyframesToCurves(keyframes))).toEqual(JSON.stringify(curves));
  });
});
