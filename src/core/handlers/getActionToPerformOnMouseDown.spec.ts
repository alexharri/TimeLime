import { CANVAS_END_START_BUFFER, CANVAS_UPPER_LOWER_BUFFER_FACTOR } from "~/core/constants";
import { getActionToPerformOnMouseDown } from "~/core/handlers/getActionToPerformOnMouseDown";
import { _MockKey } from "~/core/listener/keyboard";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { Vec2 } from "~/core/utils/math/Vec2";
import { Rect, ViewBounds } from "~/types/commonTypes";
import { Timeline } from "~/types/timelineTypes";

const viewBounds: ViewBounds = [0, 1];
const viewBoundsHeight = 0;
const scrubberHeight = 0;

describe("getActionToPerformOnMouseDown", () => {
  it("returns the expected action to perform", () => {
    const keyframes = curvesToKeyframes([
      [
        [0, 0],
        [20, 0],
        [60, 100],
        [85, 90],
      ],
    ]);
    const timeline: Timeline = {
      id: "test",
      keyframes,
    };
    const timelines = { [timeline.id]: timeline };

    const viewport: Rect = {
      left: 0,
      top: 0,
      width: 400,
      height: 400,
    };
    const length = 100;

    const x_fac = viewport.width / (viewport.width + CANVAS_END_START_BUFFER * 2);
    const y_fac = 1 / (CANVAS_UPPER_LOWER_BUFFER_FACTOR * 2 + 1);

    const getX = (t: number) => CANVAS_END_START_BUFFER + t * viewport.width * x_fac;
    const getY = (t: number) =>
      y_fac * (CANVAS_UPPER_LOWER_BUFFER_FACTOR * viewport.height + viewport.height * t);

    const k0_action = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.new(getX(0), getY(1)),
      length,
      timelines,
      viewport,
      viewBounds,
      viewBoundsHeight,
      scrubberHeight,
    });
    expect(k0_action).toEqual({
      type: "mousedown_keyframe",
      keyframe: keyframes[0],
      timelineId: "test",
    });

    const k1_action = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.new(getX(0.85), getY(0.1)),
      length,
      timelines,
      viewport,
      viewBounds,
      viewBoundsHeight,
      scrubberHeight,
    });
    expect(k1_action).toEqual({
      type: "mousedown_keyframe",
      keyframe: keyframes[1],
      timelineId: "test",
    });

    const cp0_action = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.new(getX(0.2), getY(1)),
      length,
      timelines,
      viewport,
      viewBounds,
      viewBoundsHeight,
      scrubberHeight,
    });
    expect(cp0_action).toEqual({
      keyframe: keyframes[0],
      timelineId: "test",
      type: "mousedown_control_point",
      which: "right",
    });

    const cp1_action = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.new(getX(0.6), getY(0)),
      length,
      timelines,
      viewport,
      viewBounds,
      viewBoundsHeight,
      scrubberHeight,
    });
    expect(cp1_action).toEqual({
      keyframe: keyframes[1],
      timelineId: "test",
      type: "mousedown_control_point",
      which: "left",
    });

    // Check that the alt key is propogated correctly
    _MockKey.down("Alt");
    const k0_action_alt = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.new(getX(0), getY(1)),
      length,
      timelines,
      viewport,
      viewBounds,
      viewBoundsHeight,
      scrubberHeight,
    });
    _MockKey.up("Alt");

    expect(k0_action_alt).toEqual({
      type: "alt_mousedown_keyframe",
      timelineId: "test",
      keyframe: keyframes[0],
    });

    // Check behavior for click on empty space
    const empty_action = getActionToPerformOnMouseDown({
      globalMousePosition: Vec2.new(getX(0.5), getY(0.5)),
      length,
      timelines,
      viewport,
      viewBounds,
      viewBoundsHeight,
      scrubberHeight,
    });
    expect(empty_action).toEqual({ type: "mousedown_empty" });
  });
});
