import "./preventGlobals";

import { ComponentMeta } from "@storybook/react";
import React from "react";
import { TimelineState } from "~/core/state/timeline/timelineReducer";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";

import { useTimelines } from "~/core/utils/hook/useTimelines";

const initialTimelineState: TimelineState = {
  timelines: {
    test: {
      id: "test",
      keyframes: curvesToKeyframes([
        [
          [0, 0],
          [20, 10],
          [80, 90],
          [100, 100],
        ],
        [
          [100, 100],
          [140, 120],
          [180, 30],
          [200, 100],
        ],
      ]),
    },
  },
};

export default {
  title: "Actions/Move Keyframe",
} as ComponentMeta<React.ComponentType>;

export const Test = () => {
  const { canvasRef } = useTimelines({
    initialState: initialTimelineState,
    initialSelectionState: {},
    length: 200,
  });

  return <canvas ref={canvasRef} width={800} height={400} />;
};
