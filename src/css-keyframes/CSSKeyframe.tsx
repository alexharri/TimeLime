import React, { useState } from "react";
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
  const { canvasRef } = useTimelines({ initialState });

  const [length, setLength] = useState(50);

  return (
    <div>
      <Canvas ref={canvasRef} />
      <NumberInput value={length} setValue={setLength} decimalPlaces={0} />
    </div>
  );
};
