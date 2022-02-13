import { ComponentMeta } from "@storybook/react";
import React from "react";
import { curvesToKeyframes } from "timelime/core";
import { useTimelineState } from "timelime/react";
import { TimelineState } from "timelime/types";
import "./preventGlobals";

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
  const { GraphEditor: Canvas } = useTimelineState({
    initialState: initialTimelineState,
    length: 200,
  });

  return <Canvas />;
};
