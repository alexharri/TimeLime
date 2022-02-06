import { applyTimelineKeyframeShift } from "~/core/timeline/applyTimelineKeyframeShift";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Timeline } from "~/types/timelineTypes";

const kfBase = { reflectControlPoints: true, controlPointLeft: null, controlPointRight: null };

const timeline: Timeline = {
  id: "test",
  keyframes: [
    { ...kfBase, id: "a", index: 0, value: 5 },
    { ...kfBase, id: "b", index: 10, value: 0 },
    { ...kfBase, id: "c", index: 15, value: 10 },
    { ...kfBase, id: "d", index: 20, value: 50 },
  ],
};

describe("applyTimelineKeyframeShift", () => {
  it("shifts keyframes as expected", () => {
    const out = applyTimelineKeyframeShift({
      timeline,
      keyframeShift: Vec2.new(12, 30),
      timelineSelection: { keyframes: { a: true } },
    });

    const result: Timeline = {
      id: "test",
      keyframes: [
        { ...kfBase, id: "b", index: 10, value: 0 },
        { ...kfBase, id: "a", index: 12, value: 35 },
        { ...kfBase, id: "c", index: 15, value: 10 },
        { ...kfBase, id: "d", index: 20, value: 50 },
      ],
    };
    expect(out).toEqual(result);
  });

  it("supports shifting multiple keyframes", () => {
    const out = applyTimelineKeyframeShift({
      timeline,
      keyframeShift: Vec2.new(-5, -20),
      timelineSelection: { keyframes: { b: true, c: true } },
    });

    const result: Timeline = {
      id: "test",
      keyframes: [
        { ...kfBase, id: "a", index: 0, value: 5 },
        { ...kfBase, id: "b", index: 5, value: -20 },
        { ...kfBase, id: "c", index: 10, value: -10 },
        { ...kfBase, id: "d", index: 20, value: 50 },
      ],
    };
    expect(out).toEqual(result);
  });

  it("shifted keyframes override existing ones with the same index", () => {
    const out = applyTimelineKeyframeShift({
      timeline,
      keyframeShift: Vec2.new(-5, -20),
      timelineSelection: { keyframes: { b: true, d: true } },
    });

    const result: Timeline = {
      id: "test",
      keyframes: [
        { ...kfBase, id: "a", index: 0, value: 5 },
        { ...kfBase, id: "b", index: 5, value: -20 },
        { ...kfBase, id: "d", index: 15, value: 30 },
      ],
    };
    expect(out).toEqual(result);
  });

  it("fractional indices are rounded", () => {
    const timeline: Timeline = {
      id: "test",
      keyframes: [
        { ...kfBase, id: "a", index: 0, value: 5 },
        { ...kfBase, id: "b", index: 10.123, value: 0 },
        { ...kfBase, id: "c", index: 30, value: 10 },
      ],
    };

    const out = applyTimelineKeyframeShift({
      timeline,
      keyframeShift: Vec2.new(-9.95, -4.53),
      timelineSelection: { keyframes: { b: true, c: true } },
    });

    const result: Timeline = {
      id: "test",
      keyframes: [
        { ...kfBase, id: "b", index: 0, value: -4.53 },
        { ...kfBase, id: "c", index: 20, value: 5.47 },
      ],
    };
    expect(out).toEqual(result);
  });

  it("the index is rounded, even if the index shift is 0", () => {
    const timeline: Timeline = {
      id: "test",
      keyframes: [{ ...kfBase, id: "a", index: 10.123, value: 0 }],
    };

    const out = applyTimelineKeyframeShift({
      timeline,
      keyframeShift: Vec2.new(0, 1),
      timelineSelection: { keyframes: { a: true } },
    });

    const result: Timeline = {
      id: "test",
      keyframes: [{ ...kfBase, id: "a", index: 10, value: 1 }],
    };
    expect(out).toEqual(result);
  });

  it("if two indexes are rounded to the same index, the latter keyframe is removed", () => {
    const timeline: Timeline = {
      id: "test",
      keyframes: [
        { ...kfBase, id: "a", index: 9.987, value: 0 },
        { ...kfBase, id: "b", index: 10.123, value: 1 },
      ],
    };

    const out = applyTimelineKeyframeShift({
      timeline,
      keyframeShift: Vec2.new(0, 1),
      timelineSelection: { keyframes: { a: true, b: true } },
    });

    const result: Timeline = {
      id: "test",
      keyframes: [{ ...kfBase, id: "a", index: 10, value: 1 }],
    };
    expect(out).toEqual(result);
  });
});
