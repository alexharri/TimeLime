import React from "react";
import { PrimaryState } from "~/core/state/stateTypes";
import { curvesToKeyframes } from "~/core/transform/curvesToKeyframes";
import { Canvas } from "~/css-keyframes/Canvas";
import { useTimelines } from "~/core/utils/hook/useTimelines";
import { NumberInput } from "~/css-keyframes/NumberInput/NumberInput";

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
  const { canvasRef, view, setView } = useTimelines({ initialState });

  return (
    <div>
      <Canvas ref={canvasRef} />
      <NumberInput
        value={view.length}
        setValue={(length) => {
          const t = view.length / length;
          const [low, high] = view.viewBounds.map((x) => x * t);
          setView({ length, viewBounds: [low, high] });
        }}
        decimalPlaces={0}
      />
    </div>
  );
};
