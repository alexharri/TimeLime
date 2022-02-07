import React, { useCallback, useEffect, useRef } from "react";
import { PrimaryState, ViewState } from "~/core/state/stateTypes";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { Canvas } from "~/css-keyframes/Canvas";
import { CSSKeyframesStateManagerProvider } from "~/css-keyframes/state";

const xTranslateKeyframes = curvesToKeyframes([
  [
    [0, 0],
    [50, 50],
  ],
  [
    [50, 50],
    [100, 25],
  ],
]);
const initialState: PrimaryState = {
  timelines: {
    xTranslate: {
      id: "xTranslate",
      keyframes: xTranslateKeyframes,
    },
  },
};

export const CSSKeyframes: React.FC = () => {
  return (
    <CSSKeyframesStateManagerProvider initialState={initialState}>
      <Canvas />
    </CSSKeyframesStateManagerProvider>
  );
};
