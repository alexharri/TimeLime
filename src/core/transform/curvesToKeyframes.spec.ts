import { parseCurves } from "~/core/parse/parseCurves";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { keyframesToCurves } from "~/core/transform/keyframesToCurves";
import { Curve } from "~/types/commonTypes";
import { InputCurve } from "~/types/inputTypes";
import { TimelineKeyframe } from "~/types/timelineTypes";

const keyframeBase = {
  controlPointLeft: null,
  controlPointRight: null,
  reflectControlPoints: false,
};

describe("curvesToKeyframes", () => {
  it("parses curves from objects with x, y properties", () => {
    const curves: InputCurve[] = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 50 },
      ],
    ];
    const keyframes: TimelineKeyframe[] = [
      { ...keyframeBase, id: "0", index: 0, value: 0 },
      { ...keyframeBase, id: "1", index: 10, value: 50 },
    ];
    expect(curvesToKeyframes(curves)).toEqual(keyframes);
  });

  it("parses curves from tuples ([x, y])", () => {
    const curves: InputCurve[] = [
      [
        { x: 0, y: 0 },
        { x: 10, y: 50 },
      ],
    ];
    const keyframes: TimelineKeyframe[] = [
      { ...keyframeBase, id: "0", index: 0, value: 0 },
      { ...keyframeBase, id: "1", index: 10, value: 50 },
    ];
    expect(curvesToKeyframes(curves)).toEqual(keyframes);
  });

  it("parses a cubic bezier correctly", () => {
    const curves: InputCurve[] = [
      [
        [0, 0],
        [2.5, 5],
        [7.5, 45],
        [10, 50],
      ],
    ];
    const keyframes: TimelineKeyframe[] = [
      {
        ...keyframeBase,
        id: "0",
        index: 0,
        value: 0,
        controlPointRight: {
          tx: 0.25,
          relativeToDistance: 10,
          value: 5,
        },
      },
      {
        ...keyframeBase,
        id: "1",
        index: 10,
        value: 50,
        controlPointLeft: {
          tx: 0.75,
          relativeToDistance: 10,
          value: -5,
        },
      },
    ];
    expect(curvesToKeyframes(curves)).toEqual(keyframes);
  });

  it("parses a cubic bezier and line correctly", () => {
    const curves: InputCurve[] = [
      [
        [0, 0],
        [2.5, 5],
        [7.5, 45],
        [10, 50],
      ],
      [
        [10, 50],
        [20, 25],
      ],
    ];
    const keyframes: TimelineKeyframe[] = [
      {
        ...keyframeBase,
        id: "0",
        index: 0,
        value: 0,
        controlPointRight: {
          tx: 0.25,
          relativeToDistance: 10,
          value: 5,
        },
      },
      {
        ...keyframeBase,
        id: "1",
        index: 10,
        value: 50,
        controlPointLeft: {
          tx: 0.75,
          relativeToDistance: 10,
          value: -5,
        },
      },
      {
        ...keyframeBase,
        id: "2",
        index: 20,
        value: 25,
      },
    ];
    expect(curvesToKeyframes(curves)).toEqual(keyframes);
  });

  it("correctly detects when control points should be reflected", () => {
    const curves: InputCurve[] = [
      [
        [0, 0],
        [40, 0],
        [80, 16],
        [100, 20],
      ],
      [
        [100, 20],
        [140, 28],
        [180, 12],
        [200, 10],
      ],
    ];
    const keyframes: TimelineKeyframe[] = [
      {
        ...keyframeBase,
        id: "0",
        index: 0,
        value: 0,
        controlPointRight: {
          tx: 0.4,
          relativeToDistance: 100,
          value: 0,
        },
      },
      {
        ...keyframeBase,
        id: "1",
        index: 100,
        value: 20,
        reflectControlPoints: true,
        controlPointLeft: {
          tx: 0.8,
          relativeToDistance: 100,
          value: -4,
        },
        controlPointRight: {
          tx: 0.4,
          relativeToDistance: 100,
          value: 8,
        },
      },
      {
        ...keyframeBase,
        id: "2",
        index: 200,
        value: 10,
        controlPointLeft: {
          relativeToDistance: 100,
          tx: 0.8,
          value: 2,
        },
      },
    ];
    expect(curvesToKeyframes(curves)).toEqual(keyframes);
  });

  describe("converting to keyframes and back returns the same value", () => {
    const curves: Curve[] = parseCurves([
      [
        [0, 0],
        [40, 0],
        [80, 16],
        [100, 20],
      ],
      [
        [100, 20],
        [140, 28],
        [180, 12],
        [200, 10],
      ],
    ]);
    expect(
      JSON.stringify(keyframesToCurves(curvesToKeyframes(curves)))
    ).toEqual(JSON.stringify(curves));
  });
});
