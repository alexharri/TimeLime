import { Timeline } from "timelime/types";
import { keyframeFactory } from "~core/timeline/keyframeFactory";
import { createKeyframeId } from "~core/timeline/keyframeId";

describe("createKeyframeId", () => {
  it("returns a number keyframe ID that is 1 higher than the other keyframe IDs", () => {
    const timeline: Timeline = {
      id: "test",
      keyframes: [
        keyframeFactory({ id: "1", index: 0, value: 10 }),
        keyframeFactory({ id: "54", index: 5, value: 100 }),
        keyframeFactory({ id: "32", index: 10, value: 50 }),
      ],
    };
    expect(createKeyframeId(timeline)).toEqual("55");
  });

  it("ignores keyframe IDs that contains non-digit characters", () => {
    const timeline: Timeline = {
      id: "test",
      keyframes: [
        keyframeFactory({ id: "1", index: 0, value: 10 }),
        keyframeFactory({ id: "abc", index: 0, value: 10 }),
        keyframeFactory({ id: "54", index: 5, value: 100 }),
        keyframeFactory({ id: "123-2-3", index: 0, value: 10 }),
        keyframeFactory({ id: "32", index: 10, value: 50 }),
      ],
    };
    expect(createKeyframeId(timeline)).toEqual("55");
  });
});
