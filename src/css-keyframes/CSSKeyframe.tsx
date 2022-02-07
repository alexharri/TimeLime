import React from "react";
import { PrimaryState } from "~/core/state/stateTypes";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { Canvas } from "~/css-keyframes/Canvas";
import { useTimelines } from "~/core/utils/hook/useTimelines";

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
  const { canvasRef } = useTimelines({ initialState });

  return (
    <div>
      <Canvas ref={canvasRef} />
    </div>
  );
};
