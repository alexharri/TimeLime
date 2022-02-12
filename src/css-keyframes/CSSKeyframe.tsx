import React from "react";
import { PrimaryState } from "~/core/state/stateTypes";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { useTimelineState } from "~/react/useTimelineState";
import { PropertyIds } from "~/css-keyframes/cssKeyframeConstants";
import { Timeline } from "~/css-keyframes/Timeline";

const translateXKeyframes = curvesToKeyframes([
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
    [PropertyIds.TranslateX]: {
      id: PropertyIds.TranslateX,
      keyframes: translateXKeyframes,
    },
  },
};

export const CSSKeyframes: React.FC = () => {
  const { canvasRef, Provider } = useTimelineState({
    initialState,
    length: 120,
  });

  return (
    <div>
      <Provider>
        <Timeline canvasRef={canvasRef} />
      </Provider>
    </div>
  );
};
