import React from "react";
import { PrimaryState } from "~/core/state/stateTypes";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { useTimelineState } from "~/react/useTimelineState";
import { PropertyIds } from "~/css-keyframes/src/cssKeyframeConstants";
import { Timeline } from "~/css-keyframes/src/Timeline";
import { Preview } from "~/css-keyframes/src/Preview/Preview";
import { Layout } from "~/css-keyframes/src/Layout/Layout";

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
