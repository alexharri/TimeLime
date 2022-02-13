import React from "react";
import { curvesToKeyframes } from "timelime/core";
import { useTimelineState } from "timelime/react";
import { PrimaryState } from "timelime/types";
import { Layout } from "~examples/css-keyframes/components/Layout/Layout";
import { Preview } from "~examples/css-keyframes/components/Preview/Preview";
import { Timeline } from "~examples/css-keyframes/components/Timeline/Timeline";
import { PropertyIds } from "~examples/css-keyframes/cssKeyframeConstants";

const translateXKeyframes = curvesToKeyframes([
  [
    [0, 75],
    [0, 37.6],
    [18.1, 30],
    [35, 30],
  ],
  [
    [35, 30],
    [38.8, 62.6],
    [67.1, 61.8],
    [86, 61.3],
  ],
]);

const translateYKeyframes = curvesToKeyframes([
  [
    [0, 0],
    [24.3, 0],
    [16.9, 18.7],
    [29, 22.5],
  ],
  [
    [29, 22.5],
    [47.3, 28.3],
    [64.5, 14.1],
    [91, 14.1],
  ],
]);

const initialState: PrimaryState = {
  timelines: {
    [PropertyIds.TranslateX]: {
      id: PropertyIds.TranslateX,
      keyframes: translateXKeyframes,
    },
    [PropertyIds.TranslateY]: {
      id: PropertyIds.TranslateY,
      keyframes: translateYKeyframes,
    },
  },
};

export const CSSKeyframes: React.FC = () => {
  const { Provider } = useTimelineState({
    initialState,
    length: 120,
  });

  return (
    <Provider>
      <Layout>
        <Preview />
        <Timeline />
      </Layout>
    </Provider>
  );
};
